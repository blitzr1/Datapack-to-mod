import React, { useState, useRef } from 'react';
import type {
  ModMetadata,
  ModLoader,
  ModEnvironment
} from '../types';
import { MINECRAFT_VERSIONS, COMMON_LICENSES } from '../utils/packFormatMap';
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
  Palette,
  Sparkles
} from 'lucide-react';

interface MetadataEditorProps {
  metadata: ModMetadata;
  onChange: (updated: ModMetadata) => void;
  originalPackFormat?: number;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onChange,
  originalPackFormat
}) => {
  const [authorInput, setAuthorInput] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'loaders' | 'icon' | 'links' | 'advanced'>('general');
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Mod ID validation
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
      onChange({
        ...metadata,
        authors: [...metadata.authors, clean]
      });
      setAuthorInput('');
    }
  };

  const handleRemoveAuthor = (index: number) => {
    const updated = metadata.authors.filter((_, i) => i !== index);
    onChange({ ...metadata, authors: updated });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
            const dataUrl = canvas.toDataURL('image/png');
            onChange({ ...metadata, iconDataUrl: dataUrl });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePresetIcon = (type: 'emerald' | 'diamond' | 'redstone' | 'pickaxe' | 'chest') => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgGradient = ctx.createLinearGradient(0, 0, 128, 128);
    if (type === 'emerald') {
      bgGradient.addColorStop(0, '#064e3b');
      bgGradient.addColorStop(1, '#022c22');
    } else if (type === 'diamond') {
      bgGradient.addColorStop(0, '#0c4a6e');
      bgGradient.addColorStop(1, '#082f49');
    } else if (type === 'redstone') {
      bgGradient.addColorStop(0, '#881337');
      bgGradient.addColorStop(1, '#4c0519');
    } else if (type === 'pickaxe') {
      bgGradient.addColorStop(0, '#312e81');
      bgGradient.addColorStop(1, '#1e1b4b');
    } else {
      bgGradient.addColorStop(0, '#78350f');
      bgGradient.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 124);

    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let emoji = '📦';
    if (type === 'emerald') emoji = '🟩';
    if (type === 'diamond') emoji = '💎';
    if (type === 'redstone') emoji = '⚡';
    if (type === 'pickaxe') emoji = '⛏️';
    if (type === 'chest') emoji = '🧰';

    ctx.fillText(emoji, 64, 68);

    const dataUrl = canvas.toDataURL('image/png');
    onChange({ ...metadata, iconDataUrl: dataUrl });
  };

  const loadersList: { id: ModLoader; name: string; desc: string; badge: string; color: string }[] = [
    {
      id: 'universal',
      name: 'Universal Multi-Loader',
      desc: 'Generates manifests for Fabric, NeoForge, Forge & Quilt. One JAR runs everywhere!',
      badge: 'Recommended',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'fabric',
      name: 'Fabric Only',
      desc: 'Creates fabric.mod.json with fabric-resource-loader support.',
      badge: 'Lightweight',
      color: 'border-amber-500/50 bg-amber-500/5 text-amber-300'
    },
    {
      id: 'neoforge',
      name: 'NeoForge Only',
      desc: 'Generates META-INF/neoforge.mods.toml for Minecraft 1.20.4+ and 1.21+.',
      badge: 'Modern Forge',
      color: 'border-orange-500/50 bg-orange-500/5 text-orange-400'
    },
    {
      id: 'forge',
      name: 'Forge Only',
      desc: 'Generates standard META-INF/mods.toml for classic Forge loaders.',
      badge: 'Legacy & Modern',
      color: 'border-blue-500/50 bg-blue-500/5 text-blue-400'
    },
    {
      id: 'quilt',
      name: 'Quilt Only',
      desc: 'Creates quilt.mod.json for the Quilt loader ecosystem.',
      badge: 'Quilt Ecosystem',
      color: 'border-purple-500/50 bg-purple-500/5 text-purple-400'
    }
  ];

  return (
    <div className="glass-panel-elevated rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto bg-[#0d1016]/70 backdrop-blur-md px-3 sm:px-6 pt-3 gap-2 scroll-smooth">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          General Metadata
        </button>

        <button
          onClick={() => setActiveTab('loaders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
            activeTab === 'loaders'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Mod Loaders & MC Version
        </button>

        <button
          onClick={() => setActiveTab('icon')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
            activeTab === 'icon'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Mod Icon & Logo
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Globe className="w-4 h-4" />
          Links & Socials
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
            activeTab === 'advanced'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Advanced Options
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* ================= GENERAL METADATA ================= */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mod Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mod Display Name <span className="text-emerald-400">*</span>
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
                  placeholder="e.g. Timber & Vein Miner"
                  className="w-full glass-input rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Visible name shown in the in-game mod list and crash reports.
                </p>
              </div>

              {/* Mod ID */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Mod Identifier (Mod ID) <span className="text-emerald-400">*</span>
                  </label>
                  {!isValidModId && (
                    <button
                      type="button"
                      onClick={handleFixModId}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-fix Mod ID
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={metadata.modId}
                    onChange={(e) => onChange({ ...metadata, modId: e.target.value })}
                    placeholder="e.g. timber_axe"
                    className={`w-full glass-input rounded-2xl px-4 py-3 font-mono text-sm text-white placeholder-slate-500 focus:outline-none ${
                      isValidModId
                        ? ''
                        : 'border-red-500/80 focus:border-red-500'
                    }`}
                  />
                  <div className="absolute right-3.5 top-3.5">
                    {isValidModId ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {!isValidModId ? (
                  <p className="text-[11px] text-red-400">
                    Mod ID must be lowercase alphanumeric, dashes, or underscores only (2-64 chars, no spaces).
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Unique identifier used by mod loaders (e.g. in config and registry namespaces).
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Version */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mod Version
                </label>
                <input
                  type="text"
                  value={metadata.version}
                  onChange={(e) => onChange({ ...metadata, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full glass-input rounded-2xl px-4 py-3 font-mono text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Semantic versioning recommended (e.g. 1.0.0, 1.2.1-beta).
                </p>
              </div>

              {/* License */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Software License
                </label>
                <select
                  value={metadata.license}
                  onChange={(e) => onChange({ ...metadata, license: e.target.value })}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {COMMON_LICENSES.map((lic) => (
                    <option key={lic.id} value={lic.id} className="bg-[#141820]">
                      {lic.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Specifies licensing terms for redistribution and source use.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mod Description
              </label>
              <textarea
                rows={3}
                value={metadata.description}
                onChange={(e) => onChange({ ...metadata, description: e.target.value })}
                placeholder="Describe what your datapack mod adds to Minecraft..."
                className="w-full glass-input rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none resize-y"
              />
              <p className="text-[11px] text-slate-400">
                Shown in the Mods menu in-game. Supports plain text or formatting.
              </p>
            </div>

            {/* Authors & Contributors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Authors & Contributors
              </label>
              <form onSubmit={handleAddAuthor} className="flex gap-2">
                <input
                  type="text"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="Add author name and press enter..."
                  className="flex-1 glass-input rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddAuthor()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {metadata.authors.map((author, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <span>{author}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(idx)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {metadata.authors.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No authors listed</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MOD LOADERS & VERSIONS ================= */}
        {activeTab === 'loaders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Target Mod Loader
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {loadersList.map((loader) => {
                  const isSelected = metadata.loader === loader.id;
                  return (
                    <button
                      key={loader.id}
                      type="button"
                      onClick={() => onChange({ ...metadata, loader: loader.id })}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                        isSelected
                          ? `${loader.color} border-2 shadow-lg scale-[1.01]`
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{loader.name}</h4>
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10'
                            }`}
                          >
                            {loader.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{loader.desc}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-400'
                              : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          {isSelected ? 'Selected' : 'Choose loader'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              {/* Target Minecraft Version */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Minecraft Target Version
                  </label>
                  {originalPackFormat && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Pack Format: {originalPackFormat}
                    </span>
                  )}
                </div>
                <select
                  value={metadata.targetMcVersion}
                  onChange={(e) => onChange({ ...metadata, targetMcVersion: e.target.value })}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {MINECRAFT_VERSIONS.map((v) => (
                    <option key={v.version} value={v.version} className="bg-[#141820]">
                      {v.label} (format {v.packFormat})
                    </option>
                  ))}
                  <option value="custom" className="bg-[#141820]">
                    Custom Version Range...
                  </option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Automatically configures version dependency constraints in mod manifests.
                </p>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Execution Environment
                </label>
                <select
                  value={metadata.environment}
                  onChange={(e) =>
                    onChange({ ...metadata, environment: e.target.value as ModEnvironment })
                  }
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="client_server" className="bg-[#141820]">
                    Client & Server (Standard / Multiplayer & Singleplayer)
                  </option>
                  <option value="server_only" className="bg-[#141820]">
                    Server Only (Dedicated Servers)
                  </option>
                  <option value="client_only" className="bg-[#141820]">
                    Client Only (Singleplayer / UI)
                  </option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Almost all datapacks run on both client & server.
                </p>
              </div>
            </div>

            {/* Custom Version Range */}
            {metadata.targetMcVersion === 'custom' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-200">
                  Custom Version Range Constraint
                </label>
                <input
                  type="text"
                  value={metadata.customMcVersionRange || ''}
                  onChange={(e) => onChange({ ...metadata, customMcVersionRange: e.target.value })}
                  placeholder="e.g. >=1.20 <=1.21.4"
                  className="w-full glass-input rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Specify SemVer range for Fabric and Maven range for Forge.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= MOD ICON & LOGO ================= */}
        {activeTab === 'icon' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/10">
              {/* Icon Preview */}
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-[#12151b] shadow-mc-glow flex items-center justify-center relative">
                  {metadata.iconDataUrl ? (
                    <img
                      src={metadata.iconDataUrl}
                      alt="Mod Icon Preview"
                      className="w-full h-full object-cover [image-rendering:pixelated]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-xs">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span>No Icon</span>
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  128×128
                </div>
              </div>

              {/* Upload & Actions */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <h4 className="text-base font-bold text-white">Custom Mod Icon</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload any PNG/JPG image or pick a pixel-art preset. The image is automatically scaled to crisp 128x128 for Fabric, Forge, and NeoForge mod lists.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Custom Image
                  </button>

                  {metadata.iconDataUrl && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...metadata, iconDataUrl: null })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 text-slate-300 rounded-2xl text-xs font-medium transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Icon Presets */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Quick Icon Presets
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => generatePresetIcon('emerald')}
                  className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 text-center transition-all group hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">🟩</span>
                  <span className="text-[11px] font-medium text-emerald-300 mt-1 block">Emerald</span>
                </button>

                <button
                  type="button"
                  onClick={() => generatePresetIcon('diamond')}
                  className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 hover:border-sky-400 text-center transition-all group hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">💎</span>
                  <span className="text-[11px] font-medium text-sky-300 mt-1 block">Diamond</span>
                </button>

                <button
                  type="button"
                  onClick={() => generatePresetIcon('redstone')}
                  className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 hover:border-rose-400 text-center transition-all group hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">⚡</span>
                  <span className="text-[11px] font-medium text-rose-300 mt-1 block">Redstone</span>
                </button>

                <button
                  type="button"
                  onClick={() => generatePresetIcon('pickaxe')}
                  className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 hover:border-indigo-400 text-center transition-all group hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">⛏️</span>
                  <span className="text-[11px] font-medium text-indigo-300 mt-1 block">Tools</span>
                </button>

                <button
                  type="button"
                  onClick={() => generatePresetIcon('chest')}
                  className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 text-center transition-all group hover:scale-105 active:scale-95"
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">🧰</span>
                  <span className="text-[11px] font-medium text-amber-300 mt-1 block">Storage</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= LINKS & SOCIALS ================= */}
        {activeTab === 'links' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Homepage / Website URL
                </label>
                <input
                  type="url"
                  value={metadata.homepage}
                  onChange={(e) => onChange({ ...metadata, homepage: e.target.value })}
                  placeholder="https://modrinth.com/mod/your-mod"
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                  Source Code Repository
                </label>
                <input
                  type="url"
                  value={metadata.sources}
                  onChange={(e) => onChange({ ...metadata, sources: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Issue Tracker URL
                </label>
                <input
                  type="url"
                  value={metadata.issues}
                  onChange={(e) => onChange({ ...metadata, issues: e.target.value })}
                  placeholder="https://github.com/username/repository/issues"
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ADVANCED OPTIONS ================= */}
        {activeTab === 'advanced' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4 transition-colors hover:bg-white/[0.04]">
              <input
                id="includeMcmeta"
                type="checkbox"
                checked={metadata.includePackMcmeta}
                onChange={(e) => onChange({ ...metadata, includePackMcmeta: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <label htmlFor="includeMcmeta" className="text-sm font-semibold text-white cursor-pointer">
                  Include updated pack.mcmeta in JAR root
                </label>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Allows this JAR to also function directly if placed into a world's <code className="text-emerald-400 font-mono">datapacks/</code> folder. (Recommended: On)
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4 transition-colors hover:bg-white/[0.04]">
              <input
                id="requireResourceLoader"
                type="checkbox"
                checked={metadata.requireResourceLoader}
                onChange={(e) => onChange({ ...metadata, requireResourceLoader: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <label htmlFor="requireResourceLoader" className="text-sm font-semibold text-white cursor-pointer">
                  Require Fabric Resource Loader (Fabric / Quilt)
                </label>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Declares a dependency on <code className="text-emerald-400 font-mono">fabric-resource-loader-v0</code>, the module that lets Fabric read the mod's <code className="text-emerald-400 font-mono">data/</code> directory. It ships inside Fabric API, so installing Fabric API satisfies it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
