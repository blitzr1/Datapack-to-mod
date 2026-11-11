import React, { useState } from 'react';
import type { ModMetadata } from '../types';
import {
  generateFabricModJson,
  generateNeoForgeModsToml,
  generateForgeModsToml,
  generateQuiltModJson,
  generatePackMcmeta,
  generateManifestMF
} from '../utils/metadataGenerators';
import { Copy, Check, Code } from 'lucide-react';

interface ManifestPreviewProps {
  metadata: ModMetadata;
  originalPackFormat?: number;
}

export const ManifestPreview: React.FC<ManifestPreviewProps> = ({
  metadata,
  originalPackFormat
}) => {
  const [activeTab, setActiveTab] = useState<'fabric' | 'neoforge' | 'forge' | 'quilt' | 'mcmeta' | 'manifest'>('fabric');
  const [copied, setCopied] = useState(false);

  const getActiveContent = (): { name: string; content: string; desc: string; type: string } => {
    switch (activeTab) {
      case 'fabric':
        return {
          name: 'fabric.mod.json',
          content: generateFabricModJson(metadata),
          desc: 'Fabric Loader metadata descriptor. Fabric reads this to register your mod and its datapack assets.',
          type: 'json'
        };
      case 'neoforge':
        return {
          name: 'META-INF/neoforge.mods.toml',
          content: generateNeoForgeModsToml(metadata),
          desc: 'NeoForge mod specification file for Minecraft 1.20.4+ and 1.21+.',
          type: 'toml'
        };
      case 'forge':
        return {
          name: 'META-INF/mods.toml',
          content: generateForgeModsToml(metadata),
          desc: 'Standard Forge mod definition file for Forge 1.16 - 1.20.x.',
          type: 'toml'
        };
      case 'quilt':
        return {
          name: 'quilt.mod.json',
          content: generateQuiltModJson(metadata),
          desc: 'Quilt standard mod specification file.',
          type: 'json'
        };
      case 'mcmeta':
        return {
          name: 'pack.mcmeta',
          content: generatePackMcmeta(metadata, originalPackFormat),
          desc: 'Datapack metadata file synchronized with your mod description and format.',
          type: 'json'
        };
      case 'manifest':
        return {
          name: 'META-INF/MANIFEST.MF',
          content: generateManifestMF(metadata),
          desc: 'Java Archive standard manifest declaration.',
          type: 'text'
        };
    }
  };

  const active = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel-elevated rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-5 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Code className="w-5 h-5 text-emerald-400" />
            Live Generated Mod Manifests
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Preview the exact descriptor files that will be compiled into your mod JAR in real time.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl transition-all border border-white/10 self-start sm:self-auto shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Manifest Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto bg-[#0d1016]/70 backdrop-blur-md -mx-6 sm:-mx-8 px-6 sm:px-8 pt-2 gap-2 scroll-smooth">
        {(['fabric', 'neoforge', 'forge', 'quilt', 'mcmeta', 'manifest'] as const).map((tab) => {
          const names: Record<string, string> = {
            fabric: 'fabric.mod.json',
            neoforge: 'neoforge.mods.toml',
            forge: 'mods.toml',
            quilt: 'quilt.mod.json',
            mcmeta: 'pack.mcmeta',
            manifest: 'MANIFEST.MF'
          };

          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {names[tab]}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 italic">
        {active.desc}
      </div>

      {/* Code Container */}
      <div data-lenis-prevent="true" className="rounded-2xl border border-white/10 bg-[#0a0d12] p-5 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-80 scroll-smooth shadow-inner">
        <pre className="whitespace-pre leading-relaxed">{active.content}</pre>
      </div>
    </div>
  );
};
