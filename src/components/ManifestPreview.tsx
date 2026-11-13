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
import { Copy, Check } from 'lucide-react';

interface ManifestPreviewProps {
  metadata: ModMetadata;
  originalPackFormat?: number;
}

type ManifestTab = 'fabric' | 'neoforge' | 'forge' | 'quilt' | 'mcmeta' | 'manifest';

const TAB_LABEL: Record<ManifestTab, string> = {
  fabric: 'fabric.mod.json',
  neoforge: 'neoforge.mods.toml',
  forge: 'mods.toml',
  quilt: 'quilt.mod.json',
  mcmeta: 'pack.mcmeta',
  manifest: 'MANIFEST.MF'
};

export const ManifestPreview: React.FC<ManifestPreviewProps> = ({
  metadata,
  originalPackFormat
}) => {
  const [activeTab, setActiveTab] = useState<ManifestTab>('fabric');
  const [copied, setCopied] = useState(false);

  const getActiveContent = (): { name: string; content: string; desc: string } => {
    switch (activeTab) {
      case 'fabric':
        return {
          name: 'fabric.mod.json',
          content: generateFabricModJson(metadata),
          desc: 'Fabric Loader descriptor. Declares the resource-loader dependency the pack needs.'
        };
      case 'neoforge':
        return {
          name: 'META-INF/neoforge.mods.toml',
          content: generateNeoForgeModsToml(metadata),
          desc: 'NeoForge 1.20.4 and newer, read as javafml.'
        };
      case 'forge':
        return {
          name: 'META-INF/mods.toml',
          content: generateForgeModsToml(metadata),
          desc: 'Forge, loaded as lowcodefml so a datapack-only jar is accepted.'
        };
      case 'quilt':
        return {
          name: 'quilt.mod.json',
          content: generateQuiltModJson(metadata),
          desc: 'Quilt Loader, same entry shape Quilt expects.'
        };
      case 'mcmeta':
        return {
          name: 'pack.mcmeta',
          content: generatePackMcmeta(metadata, originalPackFormat),
          desc: 'Keeps the pack_format and supported_formats your pack already declares.'
        };
      case 'manifest':
        return {
          name: 'META-INF/MANIFEST.MF',
          content: generateManifestMF(metadata),
          desc: 'Standard Java archive manifest.'
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
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 h-11 border-b border-rule">
        <span className="label">Descriptors</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 h-7 px-2 rounded border border-rule text-[11px] text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-brass-400" />
              <span className="text-brass-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-stretch gap-1 px-2 border-b border-rule overflow-x-auto">
        {(Object.keys(TAB_LABEL) as ManifestTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 h-10 font-mono text-[11px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-brass text-paper'
                : 'border-transparent text-muted hover:text-stone-300'
            }`}
          >
            {TAB_LABEL[tab]}
          </button>
        ))}
      </div>

      <p className="px-4 py-2.5 text-[11px] text-muted border-b border-rule">{active.desc}</p>

      <pre className="max-h-[420px] overflow-auto bg-ground px-4 py-3 font-mono text-[11px] leading-relaxed text-stone-200 whitespace-pre">
        {active.content}
      </pre>
    </div>
  );
};
