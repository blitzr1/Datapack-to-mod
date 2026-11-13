import React, { useState, useRef } from 'react';
import type { ModMetadata, ModLoader, ModEnvironment } from '../types';
import { MINECRAFT_VERSIONS, COMMON_LICENSES } from '../utils/packFormatMap';
import { DescriptorPanel } from './DescriptorPanel';
import {
  Globe,
  GitBranch,
  Bug,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Upload,
  RotateCcw,
  Plus,
  X,
  Layers,
  Cpu,
  ShieldCheck,
  FileCode2
} from 'lucide-react';

interface MetadataEditorProps {
  metadata: ModMetadata;
  onChange: (updated: ModMetadata) => void;
  originalPackFormat?: number;
}

type TabId = 'general' | 'loaders' | 'icon' | 'links' | 'descriptors' | 'advanced';

const TABS: Array<[TabId, typeof Cpu, string]> = [
  ['general', Cpu, 'General'],
  ['loaders', Layers, 'Loader'],
  ['icon', ImageIcon, 'Icon'],
  ['links', Globe, 'Links'],
  ['descriptors', FileCode2, 'Descriptors'],
  ['advanced', ShieldCheck, 'Advanced'],
];

const LOADER_SWATCH: Record<ModLoader, string> = {
  universal: '#A8A29A',
  fabric: '#C8A97E',
  quilt: '#A98BB8',
  forge: '#C08155',
  neoforge: '#7C9FAE',
};

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onChange,
  originalPackFormat
}) => {
  const [authorInput, setAuthorInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const iconInputRef = useRef<HTMLInputElement>(null);

  const isValidModId = /^[a-z0-9_-]{2,64}$/.test(metadata.modId);

  const handleFixModId = () => {
    const fixed = metadata.modId
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 64) || 'custom_mod';
    onChange({ ...metadata, modId: fixed });
  };

  const handleAddAuthor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = authorInput.trim();
    if (clean && !metadata.authors.includes(clean)) {
      onChange({ ...metadata, authors: [...metadata.authors, clean] });
      setAuthorInput('');
    }
  };

  const handleRemoveAuthor = (index: number) => {
    onChange({ ...metadata, authors: metadata.authors.filter((_, i) => i !== index) });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, 128, 128);
            onChange({ ...metadata, iconDataUrl: canvas.toDataURL('image/png') });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const loadersList: Array<{ id: ModLoader; name: string; desc: string }> = [
    {
      id: 'universal',
      name: 'Universal',
      desc: 'Writes all four descriptors so the same jar loads on Fabric, Quilt, Forge and NeoForge.'
    },
    {
      id: 'fabric',
      name: 'Fabric',
      desc: 'Writes fabric.mod.json and declares fabric-resource-loader-v0.'
    },
    {
      id: 'neoforge',
      name: 'NeoForge',
      desc: 'Writes META-INF/neoforge.mods.toml, read as javafml.'
    },
    {
      id: 'forge',
      name: 'Forge',
      desc: 'Writes META-INF/mods.toml, loaded as lowcodefml so no Java class is required.'
    },
    {
      id: 'quilt',
      name: 'Quilt',
      desc: 'Writes quilt.mod.json with the entry shape Quilt expects.'
    }
  ];

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-stretch gap-1 px-2 border-b border-rule">
        {TABS.map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-1.5 px-2.5 h-11 text-xs whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-brass text-paper'
                : 'border-transparent text-muted hover:text-stone-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-5">
        {/* ================= GENERAL ================= */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-1.5">
                  Display name <span className="text-brass-400">*</span>
                </label>
                <input
                  type="text"
                  value={metadata.modName}
                  onChange={(e) => {
                    const name = e.target.value;
                    onChange({
                      ...metadata,
                      modName: name,
                      modId: metadata.modId === metadata.modName.toLowerCase().replace(/\s+/g, '_')
                        ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '')
                        : metadata.modId
                    });
                  }}
                  placeholder="Timber & Vein Miner"
                  className="w-full field px-3 py-2 text-xs text-paper placeholder:text-stone-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Shown in the in-game mod list and crash reports.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="label">
                    Mod id <span className="text-brass-400">*</span>
                  </label>
                  {!isValidModId && (
                    <button
                      type="button"
                      onClick={handleFixModId}
                      className="inline-flex items-center gap-1 text-[11px] text-warn hover:underline"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Fix
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={metadata.modId}
                    onChange={(e) => onChange({ ...metadata, modId: e.target.value })}
                    placeholder="timber_axe"
                    className={`w-full field pl-3 pr-8 py-2 font-mono text-[11px] text-paper placeholder:text-stone-500 focus:outline-none ${
                      isValidModId ? '' : 'border-bad/70'
                    }`}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {isValidModId ? (
                      <Check className="w-3.5 h-3.5 text-brass-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-bad" />
                    )}
                  </span>
                </div>
                <p className={`mt-1 text-[11px] ${isValidModId ? 'text-muted' : 'text-bad'}`}>
                  {isValidModId
                    ? 'Namespace the loaders use for config and registries.'
                    : 'Lowercase letters, digits, dashes or underscores, 2–64 characters.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-1.5">Version</label>
                <input
                  type="text"
                  value={metadata.version}
                  onChange={(e) => onChange({ ...metadata, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full field px-3 py-2 font-mono text-[11px] text-paper placeholder:text-stone-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted">Semver, e.g. 1.2.1-beta.</p>
              </div>

              <div>
                <label className="label block mb-1.5">License</label>
                <select
                  value={metadata.license}
                  onChange={(e) => onChange({ ...metadata, license: e.target.value })}
                  className="w-full field px-3 py-2 text-xs text-paper focus:outline-none cursor-pointer"
                >
                  {COMMON_LICENSES.map((lic) => (
                    <option key={lic.id} value={lic.id} className="bg-panel">
                      {lic.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-muted">Redistribution terms, written into the descriptors.</p>
              </div>
            </div>

            <div>
              <label className="label block mb-1.5">Description</label>
              <textarea
                rows={3}
                value={metadata.description}
                onChange={(e) => onChange({ ...metadata, description: e.target.value })}
                placeholder="What the pack adds to the game"
                className="w-full field px-3 py-2 text-xs text-paper placeholder:text-stone-500 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="label block mb-1.5">Authors</label>
              <form onSubmit={handleAddAuthor} className="flex gap-2">
                <input
                  type="text"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="Name, then Enter"
                  className="flex-1 field px-3 py-2 text-xs text-paper placeholder:text-stone-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddAuthor()}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-rule text-[11px] text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {metadata.authors.map((author, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1 h-7 rounded border border-rule bg-raised text-[11px] text-stone-200"
                  >
                    {author}
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(idx)}
                      className="p-0.5 rounded text-muted hover:text-bad transition-colors"
                      aria-label={`Remove ${author}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {metadata.authors.length === 0 && (
                  <span className="text-[11px] text-muted">None listed</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= LOADERS ================= */}
        {activeTab === 'loaders' && (
          <div className="space-y-5">
            <div>
              <span className="label block mb-2">Target loader</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {loadersList.map((loader) => {
                  const isSelected = metadata.loader === loader.id;
                  return (
                    <button
                      key={loader.id}
                      type="button"
                      onClick={() => onChange({ ...metadata, loader: loader.id })}
                      className={`text-left p-3 rounded border transition-colors ${
                        isSelected
                          ? 'border-brass-700 bg-raised'
                          : 'border-rule bg-panel hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: LOADER_SWATCH[loader.id] }}
                        />
                        <span className="text-xs font-medium text-paper">{loader.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-brass-400 ml-auto" />}
                      </div>
                      <p className="mt-1 text-[11px] text-muted leading-relaxed">{loader.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-rule">
              <div>
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <label className="label">Minecraft target</label>
                  {originalPackFormat && (
                    <span className="font-mono text-[11px] text-muted tnum">
                      pack format {originalPackFormat}
                    </span>
                  )}
                </div>
                <select
                  value={metadata.targetMcVersion}
                  onChange={(e) => onChange({ ...metadata, targetMcVersion: e.target.value })}
                  className="w-full field px-3 py-2 text-xs text-paper focus:outline-none cursor-pointer"
                >
                  {MINECRAFT_VERSIONS.map((v) => (
                    <option key={v.version} value={v.version} className="bg-panel">
                      {v.label} (format {v.packFormat})
                    </option>
                  ))}
                  <option value="custom" className="bg-panel">
                    Custom range
                  </option>
                </select>
                <p className="mt-1 text-[11px] text-muted">
                  Sets the version range in the descriptors.
                </p>
              </div>

              <div>
                <label className="label block mb-1.5">Environment</label>
                <select
                  value={metadata.environment}
                  onChange={(e) =>
                    onChange({ ...metadata, environment: e.target.value as ModEnvironment })
                  }
                  className="w-full field px-3 py-2 text-xs text-paper focus:outline-none cursor-pointer"
                >
                  <option value="client_server" className="bg-panel">Client and server</option>
                  <option value="server_only" className="bg-panel">Server only</option>
                  <option value="client_only" className="bg-panel">Client only</option>
                </select>
                <p className="mt-1 text-[11px] text-muted">Most datapacks need both sides.</p>
              </div>
            </div>

            {metadata.targetMcVersion === 'custom' && (
              <div className="p-3 rounded border border-rule bg-raised">
                <label className="label block mb-1.5">Custom range</label>
                <input
                  type="text"
                  value={metadata.customMcVersionRange || ''}
                  onChange={(e) => onChange({ ...metadata, customMcVersionRange: e.target.value })}
                  placeholder=">=1.20 <=1.21.4"
                  className="w-full field px-3 py-2 font-mono text-[11px] text-paper focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Semver range for Fabric, Maven range for Forge.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= ICON ================= */}
        {activeTab === 'icon' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded border border-rule bg-raised">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-sm overflow-hidden border border-rule bg-ground flex items-center justify-center">
                  {metadata.iconDataUrl ? (
                    <img
                      src={metadata.iconDataUrl}
                      alt="Mod icon preview"
                      className="w-full h-full object-cover [image-rendering:pixelated]"
                    />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-muted" />
                  )}
                </div>
                <span className="absolute -bottom-2 -right-2 bg-panel border border-rule text-[11px] font-mono text-muted px-1.5 py-0.5 rounded-sm tnum">
                  128x128
                </span>
              </div>

              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                <h4 className="text-xs font-medium text-paper">Mod icon</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  PNG or JPG, scaled to 128x128. Only written into the descriptors when an image is
                  present.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded bg-brass-500 hover:bg-brass-400 text-ground text-[11px] font-semibold transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Upload image
                  </button>

                  {metadata.iconDataUrl && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...metadata, iconDataUrl: null })}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-rule text-[11px] text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {metadata.iconDataUrl && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1">
                <span className="label">Menu size</span>
                <div className="flex items-end gap-5">
                  {[64, 32].map((size) => (
                    <div key={size} className="flex flex-col items-center gap-2">
                      <img
                        src={metadata.iconDataUrl ?? undefined}
                        alt=""
                        width={size}
                        height={size}
                        className="border border-rule bg-ground [image-rendering:pixelated]"
                      />
                      <span className="font-mono text-[11px] text-muted tnum">{size}px</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= LINKS ================= */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3 h-3" /> Homepage
              </label>
              <input
                type="url"
                value={metadata.homepage}
                onChange={(e) => onChange({ ...metadata, homepage: e.target.value })}
                placeholder="https://modrinth.com/mod/your-mod"
                className="w-full field px-3 py-2 font-mono text-[11px] text-paper placeholder:text-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <GitBranch className="w-3 h-3" /> Source
              </label>
              <input
                type="url"
                value={metadata.sources}
                onChange={(e) => onChange({ ...metadata, sources: e.target.value })}
                placeholder="https://github.com/username/repository"
                className="w-full field px-3 py-2 font-mono text-[11px] text-paper placeholder:text-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5 mb-1.5">
                <Bug className="w-3 h-3" /> Issues
              </label>
              <input
                type="url"
                value={metadata.issues}
                onChange={(e) => onChange({ ...metadata, issues: e.target.value })}
                placeholder="https://github.com/username/repository/issues"
                className="w-full field px-3 py-2 font-mono text-[11px] text-paper placeholder:text-stone-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'descriptors' && (
          <DescriptorPanel metadata={metadata} onChange={onChange} />
        )}

        {/* ================= ADVANCED ================= */}
        {activeTab === 'advanced' && (
          <div className="space-y-3">
            <label
              htmlFor="includeMcmeta"
              className="flex items-start gap-3 p-3 rounded border border-rule bg-raised cursor-pointer hover:border-stone-600 transition-colors"
            >
              <input
                id="includeMcmeta"
                type="checkbox"
                checked={metadata.includePackMcmeta}
                onChange={(e) => onChange({ ...metadata, includePackMcmeta: e.target.checked })}
                className="mt-0.5 w-3.5 h-3.5 accent-brass-500 cursor-pointer"
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-paper">
                  Write pack.mcmeta to the jar root
                </span>
                <span className="block mt-0.5 text-[11px] text-muted leading-relaxed">
                  Also lets the jar work when dropped into a world's{' '}
                  <code className="font-mono text-stone-300">datapacks/</code> folder.
                </span>
              </span>
            </label>

            <label
              htmlFor="requireResourceLoader"
              className="flex items-start gap-3 p-3 rounded border border-rule bg-raised cursor-pointer hover:border-stone-600 transition-colors"
            >
              <input
                id="requireResourceLoader"
                type="checkbox"
                checked={metadata.requireResourceLoader}
                onChange={(e) => onChange({ ...metadata, requireResourceLoader: e.target.checked })}
                className="mt-0.5 w-3.5 h-3.5 accent-brass-500 cursor-pointer"
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-paper">
                  Require fabric-resource-loader-v0
                </span>
                <span className="block mt-0.5 text-[11px] text-muted leading-relaxed">
                  The Fabric module that reads a mod's{' '}
                  <code className="font-mono text-stone-300">data/</code> directory. Fabric API ships
                  it.
                </span>
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
