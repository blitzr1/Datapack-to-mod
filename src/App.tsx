import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
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
import type { ModMetadata, PackFile, DatapackSummary, SamplePack } from './types';
import {
  Package,
  Download,
  Shield,
  FolderArchive,
  Terminal,
  Zap,
  Cpu,
  Upload
} from 'lucide-react';

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

  // Lenis instance ref
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize True Mouse Wheel Momentum & Smooth Scroll
  useEffect(() => {
    let lastWheelTime = 0;
    let wheelMomentum = 1.0;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.8,
      touchMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false,
      respectReducedMotion: false,
      virtualScroll: (data) => {
        const now = performance.now();
        const timeSinceLast = now - lastWheelTime;
        lastWheelTime = now;

        const event = data.event;
        const isWheelEvent = 'deltaY' in event;
        const isMouseWheel =
          isWheelEvent &&
          ((event as WheelEvent).deltaMode === 1 ||
            (Math.abs((event as WheelEvent).deltaY) >= 40 && Number.isInteger((event as WheelEvent).deltaY)));

        if (isMouseWheel) {
          if (timeSinceLast < 220) {
            wheelMomentum = Math.min(wheelMomentum + 0.35, 2.4);
          } else {
            wheelMomentum = 1.0;
          }

          data.deltaY *= 1.5 * wheelMomentum;
        }

        return true;
      }
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Stop Lenis background scrolling when modals are open
  useEffect(() => {
    if (lenisRef.current) {
      if (showConvertModal || showHelpModal) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }
  }, [showConvertModal, showHelpModal]);

  // Smooth scroll to top when pack is loaded
  useEffect(() => {
    if (files && lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.8 });
    }
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
      lenisRef.current?.scrollTo(0, { duration: 0.6 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0e] text-slate-100 relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Modern Animated Ambient Blurred Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Glow Orb 1: Emerald Top Left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-500/12 blur-[120px] animate-pulse-slow" />
        {/* Glow Orb 2: Electric Cyan Top Right */}
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] animate-float-slow" />
        {/* Glow Orb 3: Deep Royal Purple Center Bottom */}
        <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[140px] animate-float-reverse" />
        {/* Glow Orb 4: Warm Amber / Gold Mid Left */}
        <div className="absolute top-2/3 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[120px] animate-float-slow" />
        {/* Tech Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />
      </div>

      {/* Global Drag & Drop Full-screen Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md border-4 border-dashed border-emerald-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150 pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4 shadow-mc-glow">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Drop your Datapack here</h3>
          <p className="text-sm text-slate-300 mt-1">Release to extract and convert to Mod JAR immediately</p>
        </div>
      )}

      <Header
        hasPack={Boolean(files && metadata)}
        onReset={handleReset}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!files || !metadata || !summary ? (
          /* ================= UPLOAD SCREEN ================= */
          <div className="space-y-16 animate-in fade-in duration-300">
            <UploadZone
              onFileLoaded={handleFileLoaded}
              onFilesListLoaded={handleFilesListLoaded}
              onSampleSelected={handleSampleSelected}
              isLoading={isLoading}
              error={error}
            />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div className="p-7 rounded-3xl glass-panel-elevated space-y-3.5 transition-all duration-300 hover:border-emerald-500/30 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Universal Multi-Loader</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates an all-in-one JAR supporting <strong className="text-slate-200">Fabric</strong>, <strong className="text-slate-200">NeoForge</strong>, and <strong className="text-slate-200">Forge</strong>. Players drop one single file into their mods folder regardless of loader.
                </p>
              </div>

              <div className="p-7 rounded-3xl glass-panel-elevated space-y-3.5 transition-all duration-300 hover:border-cyan-500/30 group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Full Metadata Control</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customize Mod ID, display name, version, authors, license, homepage, target Minecraft versions, and upload or generate custom mod pixel-art icons.
                </p>
              </div>

              <div className="p-7 rounded-3xl glass-panel-elevated space-y-3.5 transition-all duration-300 hover:border-purple-500/30 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">100% In-Browser & Private</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All compilation runs locally in your browser using WebAssembly & JSZip. Your datapack never leaves your machine — zero server latency and unlimited file size.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ================= WORKSPACE SCREEN ================= */
          <div className="space-y-6 pb-28 animate-in fade-in duration-300">
            {/* Top Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 overflow-hidden [image-rendering:pixelated] shadow-md shadow-emerald-500/20 flex-shrink-0">
                  {metadata.iconDataUrl ? (
                    <img src={metadata.iconDataUrl} alt="Mod Icon" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-7 h-7" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                      {metadata.modName || metadata.modId}
                    </h2>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium shadow-sm">
                      v{metadata.version}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                      {metadata.loader.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1 truncate">
                    Mod ID: <span className="text-emerald-400 font-bold">{metadata.modId}</span> • MC {metadata.targetMcVersion} • {summary.totalFiles} files
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleStartBuild}
                  disabled={isBuilding}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Convert to Mod JAR
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-2 pb-px overflow-x-auto scroll-smooth">
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('metadata')}
                className={`px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeWorkspaceTab === 'metadata'
                    ? 'bg-[#151a24]/90 text-emerald-400 border-t-2 border-emerald-400 shadow-md backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Mod Metadata & Config
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('files')}
                className={`px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeWorkspaceTab === 'files'
                    ? 'bg-[#151a24]/90 text-emerald-400 border-t-2 border-emerald-400 shadow-md backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <FolderArchive className="w-4 h-4" />
                Datapack Files ({summary.totalFiles})
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('manifests')}
                className={`px-5 py-3 rounded-t-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeWorkspaceTab === 'manifests'
                    ? 'bg-[#151a24]/90 text-emerald-400 border-t-2 border-emerald-400 shadow-md backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Manifest Previews
              </button>
            </div>

            {/* Tab Views */}
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
        )}
      </main>

      {/* Floating Bottom Convert CTA (when pack is loaded) */}
      {files && metadata && (
        <div className="fixed bottom-0 inset-x-0 bg-[#0c0f15]/80 backdrop-blur-2xl border-t border-white/[0.08] py-4 px-4 sm:px-8 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span>Ready to package: <strong className="text-white font-mono">{metadata.modId}-{metadata.version}.jar</strong> ({metadata.loader.toUpperCase()})</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleStartBuild}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-500/25"
              >
                <Download className="w-4 h-4" />
                Compile & Download .JAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Modals */}
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
