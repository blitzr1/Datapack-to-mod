import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { MetadataEditor } from './components/MetadataEditor';
import { FileExplorer } from './components/FileExplorer';
import { ManifestPreview } from './components/ManifestPreview';
import { ConvertModal } from './components/ConvertModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Footer } from './components/Footer';
import {
  parseDatapackZip,
  parseDatapackFilesList
} from './utils/datapackParser';
import { buildModJar, triggerDownload } from './utils/jarBuilder';
import { getVersionByPackFormat } from './utils/packFormatMap';
import type { ModLoader, ModMetadata, PackFile, DatapackSummary, SamplePack } from './types';
import { Package, Download, Upload } from 'lucide-react';

const LOADER_SWATCH: Record<ModLoader, string> = {
  universal: '#A8A29A',
  fabric: '#C8A97E',
  quilt: '#A98BB8',
  forge: '#C08155',
  neoforge: '#7C9FAE',
};

const LOADER_LABEL: Record<ModLoader, string> = {
  universal: 'Universal (4 manifests)',
  fabric: 'Fabric',
  quilt: 'Quilt',
  forge: 'Forge',
  neoforge: 'NeoForge',
};

// The ruler only shows where a pack sits in the format timeline.
// Compatibility itself still comes from packFormatMap.
const FORMAT_SCALE = [48, 57, 71, 88, 107];

const formatBytes = (bytes: number) => {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const SpecRow: React.FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-3 px-4 py-2">
    <dt className="label">{label}</dt>
    <dd className="font-mono text-xs text-paper tnum truncate">{children}</dd>
  </div>
);

export function App() {
  const [files, setFiles] = useState<Map<string, PackFile> | null>(null);
  const [summary, setSummary] = useState<DatapackSummary | null>(null);
  const [metadata, setMetadata] = useState<ModMetadata | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global window drag & drop overlay state
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  // Build / Compilation State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState('');
  const [isBuildComplete, setIsBuildComplete] = useState(false);
  const [builtJarBlob, setBuiltJarBlob] = useState<Blob | null>(null);
  const [builtJarFileName, setBuiltJarFileName] = useState('');
  const [builtJarSize, setBuiltJarSize] = useState(0);

  // Modals
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Active workspace tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'metadata' | 'files' | 'manifests'>('metadata');

  // Lock the page behind open modals
  useEffect(() => {
    document.body.style.overflow = showConvertModal || showHelpModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showConvertModal, showHelpModal]);

  // Bring the workspace into view once a pack is loaded
  useEffect(() => {
    if (files) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [files]);

  // Global window drag and drop listener
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget || e.clientX <= 0 || e.clientY <= 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragging(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 1 && droppedFiles[0].name.toLowerCase().endsWith('.zip')) {
          handleFileLoaded(droppedFiles[0]);
        } else {
          handleFilesListLoaded(droppedFiles);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFileLoaded = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseDatapackZip(file);
      if (result.files.size === 0) {
        throw new Error('The selected ZIP does not contain any files.');
      }
      setFiles(result.files);
      setSummary(result.summary);
      setMetadata(result.suggestedMetadata as ModMetadata);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to read datapack archive. Ensure it is a valid .zip file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesListLoaded = async (fileList: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseDatapackFilesList(fileList);
      if (result.files.size === 0) {
        throw new Error('No files found in the uploaded directory.');
      }
      setFiles(result.files);
      setSummary(result.summary);
      setMetadata(result.suggestedMetadata as ModMetadata);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to parse folder contents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelected = (sample: SamplePack) => {
    const filesMap = new Map<string, PackFile>();
    let totalSize = 0;
    const namespaces = new Set<string>();

    const counts = {
      functions: 0,
      recipes: 0,
      lootTables: 0,
      tags: 0,
      advancements: 0,
      predicates: 0,
      structures: 0,
      worldgen: 0,
      other: 0,
    };

    Object.entries(sample.files).forEach(([path, content]) => {
      const raw = new TextEncoder().encode(content);
      totalSize += raw.byteLength;

      filesMap.set(path, {
        path,
        size: raw.byteLength,
        isBinary: false,
        content,
        raw
      });

      const match = path.match(/^data\/([^/]+)\/(.+)$/);
      if (match) {
        namespaces.add(match[1]);
        const sub = match[2];
        if (sub.includes('function')) counts.functions++;
        else if (sub.includes('recipe')) counts.recipes++;
        else if (sub.includes('loot_table')) counts.lootTables++;
        else if (sub.includes('tag')) counts.tags++;
        else if (sub.includes('advancement')) counts.advancements++;
        else counts.other++;
      }
    });

    const modId = sample.id;
    const modName = sample.name;

    setFiles(filesMap);
    setSummary({
      packFormat: 48,
      originalDescription: sample.description,
      namespaces: Array.from(namespaces),
      totalFiles: filesMap.size,
      totalSize,
      counts
    });

    setMetadata({
      modId,
      modName,
      version: '1.0.0',
      description: sample.description,
      authors: ['Datapack Creator'],
      license: 'MIT',
      homepage: '',
      sources: '',
      issues: '',
      loader: 'universal',
      targetMcVersion: '1.21',
      environment: 'client_server',
      includePackMcmeta: true,
      requireResourceLoader: true,
      iconDataUrl: null
    });
  };

  const handleDeleteFile = (path: string) => {
    if (!files || !summary) return;
    const nextFiles = new Map(files);
    nextFiles.delete(path);
    setFiles(nextFiles);

    setSummary({
      ...summary,
      totalFiles: nextFiles.size
    });
  };

  const handleStartBuild = async () => {
    if (!files || !metadata) return;

    setIsBuilding(true);
    setShowConvertModal(true);
    setIsBuildComplete(false);
    setBuildProgress(5);
    setBuildStatus('Preparing datapack files and mod descriptors...');

    try {
      const result = await buildModJar(files, metadata, (percent, status) => {
        setBuildProgress(percent);
        setBuildStatus(status);
      });

      setBuiltJarBlob(result.blob);
      setBuiltJarFileName(result.fileName);
      setBuiltJarSize(result.size);
      setIsBuildComplete(true);
      setBuildProgress(100);
      setBuildStatus('Ready! Your Minecraft Mod JAR is compiled.');
    } catch (err: any) {
      console.error(err);
      setBuildStatus(`Error: ${err?.message || 'Failed to compile JAR'}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDownload = () => {
    if (builtJarBlob && builtJarFileName) {
      triggerDownload(builtJarBlob, builtJarFileName);
    }
  };

  const handleReset = () => {
    if (window.confirm('Start over with a new datapack? Any unsaved edits will be discarded.')) {
      setFiles(null);
      setSummary(null);
      setMetadata(null);
      setError(null);
      setBuiltJarBlob(null);
      setIsBuildComplete(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isWorkspace = Boolean(files && metadata && summary);

  return (
    <div className="min-h-screen flex flex-col bg-ground text-paper">
      {/* Global Drag & Drop Full-screen Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-ground/95 border-2 border-dashed border-brass-600 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <Upload className="w-8 h-8 text-brass-400 mb-4" />
          <h3 className="text-xl font-semibold text-paper">Drop your datapack</h3>
          <p className="mt-1 font-mono text-xs text-muted">release to read the zip or folder</p>
        </div>
      )}

      <Header
        hasPack={isWorkspace}
        onReset={handleReset}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!files || !metadata || !summary ? (
          /* ================= UPLOAD SCREEN ================= */
          <div className="max-w-3xl mx-auto space-y-10">
            <div>
              <h1 className="text-[28px] sm:text-[34px] leading-[1.15] font-semibold tracking-[-0.02em] text-paper">
                A datapack zip in.<br />
                A loadable mod jar out.
              </h1>
              <p className="mt-3 text-sm text-muted max-w-[62ch] leading-relaxed">
                Drop the zip you exported from your pack editor. Everything is packaged in your browser
                memory — the archive is never uploaded, and the payload is copied byte for byte.
              </p>
            </div>

            <UploadZone
              onFileLoaded={handleFileLoaded}
              onFilesListLoaded={handleFilesListLoaded}
              onSampleSelected={handleSampleSelected}
              isLoading={isLoading}
              error={error}
            />

            {/* What the jar contains, as a ruled table rather than feature cards */}
            <dl className="border-t border-rule">
              {[
                ['Payload', 'Every file in the pack is copied as-is, including binary assets. Only descriptors are added.'],
                ['Descriptors', 'fabric.mod.json, quilt.mod.json, mods.toml and neoforge.mods.toml — one jar can carry all four.'],
                ['Compatibility', 'pack.mcmeta keeps the pack_format and supported_formats your pack already declares.'],
                ['Privacy', 'No upload, no backend, no analytics. The browser is the whole pipeline.'],
              ].map(([term, detail]) => (
                <div key={term} className="grid grid-cols-[92px_1fr] gap-4 py-3 border-b border-rule items-baseline">
                  <dt className="label">{term}</dt>
                  <dd className="text-xs text-stone-300 leading-relaxed">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          /* ================= WORKSPACE SCREEN ================= */
          <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start pb-20 lg:pb-0">
            {/* Mobile build bar: the primary action stays in reach while editing */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-ground px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-paper truncate">
                    {metadata.modName || metadata.modId}
                  </p>
                  <p className="font-mono text-[11px] text-muted truncate mt-0.5">
                    {metadata.modId}-{metadata.version}.jar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartBuild}
                  disabled={isBuilding}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ground font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {isBuilding ? 'Building…' : 'Build jar'}
                </button>
              </div>
            </div>

            {/* Spec plate: the pack's facts, read once, then left in place */}
            <aside className="lg:sticky lg:top-[68px] space-y-3 mb-6 lg:mb-0">
              <section className="panel shadow-panel">
                <header className="flex items-center justify-between gap-2 px-4 h-11 border-b border-rule">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: LOADER_SWATCH[metadata.loader] }}
                    />
                    <span className="label truncate">{LOADER_LABEL[metadata.loader]}</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted tnum flex-shrink-0">v{metadata.version}</span>
                </header>

                <div className="px-4 py-4 flex items-center gap-3 border-b-0 lg:border-b lg:border-rule">
                  <div className="w-11 h-11 rounded-sm border border-rule bg-ground flex items-center justify-center overflow-hidden [image-rendering:pixelated] flex-shrink-0">
                    {metadata.iconDataUrl ? (
                      <img src={metadata.iconDataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-paper leading-tight truncate">
                      {metadata.modName || metadata.modId}
                    </h2>
                    <p className="font-mono text-[11px] text-muted truncate mt-0.5">{metadata.modId}</p>
                  </div>
                </div>

                <dl className="hidden lg:block divide-y divide-rule py-1">
                  <SpecRow label="Pack format">{summary.packFormat}</SpecRow>
                  <SpecRow label="MC range">{metadata.customMcVersionRange || metadata.targetMcVersion}</SpecRow>
                  <SpecRow label="Files">{summary.totalFiles}</SpecRow>
                  <SpecRow label="Size">{formatBytes(summary.totalSize)}</SpecRow>
                  <SpecRow label="Namespaces">
                    {summary.namespaces.length > 0 ? summary.namespaces.join(', ') : '—'}
                  </SpecRow>
                  <SpecRow label="License">{metadata.license || '—'}</SpecRow>
                </dl>

                {/* Format scale: where this pack sits in the pack_format timeline */}
                <div className="hidden lg:grid grid-cols-5 border-t border-rule px-1 pt-3 pb-2">
                  {FORMAT_SCALE.map((format) => {
                    const active = format === summary.packFormat;
                    const passed = summary.packFormat >= format;
                    return (
                      <div
                        key={format}
                        className={`px-1 pt-1.5 border-t-2 ${
                          active ? 'border-brass' : 'border-rule'
                        }`}
                      >
                        <div
                          className={`font-mono text-[11px] leading-none tnum ${
                            active ? 'text-brass' : passed ? 'text-stone-400' : 'text-stone-600'
                          }`}
                        >
                          {format}
                        </div>
                        <div
                          className={`text-[11px] leading-tight mt-1 truncate ${
                            active ? 'text-stone-300' : 'text-muted'
                          }`}
                        >
                          {getVersionByPackFormat(format).version}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden lg:block p-3 border-t border-rule">
                  <button
                    type="button"
                    onClick={handleStartBuild}
                    disabled={isBuilding}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ground font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    {isBuilding ? 'Building…' : 'Build jar'}
                  </button>
                  <p className="mt-2 font-mono text-[11px] text-muted text-center truncate">
                    {metadata.modId}-{metadata.version}.jar
                  </p>
                </div>
              </section>

              <button
                type="button"
                onClick={handleReset}
                className="hidden lg:block w-full text-[11px] text-muted hover:text-paper transition-colors py-1"
              >
                Start over with another pack
              </button>
            </aside>

            {/* Editor column */}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-0.5 p-0.5 mb-4 rounded-md border border-rule bg-panel">
                {([
                  ['metadata', 'Metadata'],
                  ['files', `Files (${summary.totalFiles})`],
                  ['manifests', 'Manifests'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveWorkspaceTab(id)}
                    aria-pressed={activeWorkspaceTab === id}
                    className={`h-8 px-3 rounded text-xs whitespace-nowrap transition-colors ${
                      activeWorkspaceTab === id
                        ? 'bg-raised text-paper'
                        : 'text-muted hover:text-stone-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeWorkspaceTab === 'metadata' && (
                <MetadataEditor
                  metadata={metadata}
                  onChange={setMetadata}
                  originalPackFormat={summary.packFormat}
                />
              )}

              {activeWorkspaceTab === 'files' && (
                <FileExplorer
                  files={files}
                  summary={summary}
                  onDeleteFile={handleDeleteFile}
                />
              )}

              {activeWorkspaceTab === 'manifests' && (
                <ManifestPreview
                  metadata={metadata}
                  originalPackFormat={summary.packFormat}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <ConvertModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        progress={buildProgress}
        statusText={buildStatus}
        isComplete={isBuildComplete}
        onDownload={handleDownload}
        metadata={metadata || ({} as ModMetadata)}
        jarSize={builtJarSize}
        fileName={builtJarFileName}
      />

      <HowItWorksModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}

export default App;
