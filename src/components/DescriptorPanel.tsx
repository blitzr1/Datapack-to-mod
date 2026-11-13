import React, { useState } from 'react';
import type { ModMetadata, ModLoader } from '../types';
import {
  generateFabricModJson,
  generateForgeModsToml,
  generateNeoForgeModsToml,
  generateQuiltModJson,
  minecraftRangeFor
} from '../utils/metadataGenerators';
import { Check, Code2, Copy, Lock } from 'lucide-react';

type DescriptorId = 'fabric' | 'forge' | 'neoforge' | 'quilt';

interface DescriptorField {
  label: string;
  value: string;
  note?: string;
  // Locked fields are real descriptor keys this converter cannot fill: they
  // point at Java, or writing them would break loading.
  locked?: boolean;
}

interface MetadataEditorProps {
  metadata: ModMetadata;
  onChange: (updated: ModMetadata) => void;
}

// Every loader gets the same keys here; only the two TOML files read them.
const DESCRIPTOR_FILES: Record<DescriptorId, { loader: string; path: string; generate: (m: ModMetadata) => string }> = {
  fabric: { loader: 'Fabric', path: 'fabric.mod.json', generate: generateFabricModJson },
  forge: { loader: 'Forge', path: 'META-INF/mods.toml', generate: generateForgeModsToml },
  neoforge: { loader: 'NeoForge', path: 'META-INF/neoforge.mods.toml', generate: generateNeoForgeModsToml },
  quilt: { loader: 'Quilt', path: 'quilt.mod.json', generate: generateQuiltModJson }
};

function filesFor(loader: ModLoader): DescriptorId[] {
  return loader === 'universal' ? ['fabric', 'forge', 'neoforge', 'quilt'] : [loader];
}

function factsFor(meta: ModMetadata, id: DescriptorId): DescriptorField[] {
  const modId = meta.modId || 'mod_id';
  const version = meta.version || '1.0.0';
  const mc = minecraftRangeFor(meta);
  const icon = meta.iconDataUrl ? 'written from the uploaded image' : 'not written (no icon uploaded)';

  if (id === 'fabric') {
    const env = meta.environment === 'client_only' ? 'client' : meta.environment === 'server_only' ? 'server' : '*';
    return [
      { label: 'schemaVersion', value: '1', note: 'Fixed by the Fabric spec.' },
      { label: 'id', value: modId },
      { label: 'version', value: version },
      { label: 'environment', value: env },
      { label: 'icon', value: icon },
      {
        label: 'depends.minecraft',
        value: mc,
        note: meta.packFormat ? `Follows the pack's own format (${meta.packFormat}).` : undefined
      },
      {
        label: 'depends.fabric-resource-loader-v0',
        value: meta.requireResourceLoader ? '*' : 'not declared',
        note: 'Toggle it in Advanced Options.'
      },
      {
        label: 'entrypoints',
        value: 'none',
        locked: true,
        note: 'Entrypoints name Java classes to run. A converted datapack ships no Java.'
      },
      {
        label: 'mixins',
        value: 'none',
        locked: true,
        note: 'Mixins patch compiled Java bytecode. There is nothing here to patch.'
      },
      {
        label: 'accessWidener',
        value: 'none',
        locked: true,
        note: 'Only changes Java access rules for compiled mods.'
      }
    ];
  }

  if (id === 'quilt') {
    return [
      { label: 'quilt_loader.group', value: `mod.${modId}`, note: 'Quilt requires a group; nesting it under your mod id keeps it unique.' },
      { label: 'quilt_loader.id', value: modId },
      { label: 'version', value: version },
      { label: 'metadata.icon', value: icon },
      { label: 'depends.quilt_loader', value: '>=0.20.0' },
      { label: 'depends.minecraft', value: mc },
      {
        label: 'entrypoints',
        value: 'none',
        locked: true,
        note: 'Quilt entrypoints point at Java classes; this jar has none.'
      }
    ];
  }

  const isForge = id === 'forge';
  return [
    {
      label: 'modLoader',
      value: isForge ? 'lowcodefml' : 'javafml',
      note: isForge
        ? 'Forge\'s no-Java loader. javafml would make Forge search for a @Mod class this jar does not have.'
        : 'NeoForge has no low-code provider; it reads a metadata-only mod directly.'
    },
    {
      label: 'loaderVersion',
      value: isForge ? '[40,)' : '[1,)',
      note: isForge ? 'First Forge loader line that ships the low-code provider.' : undefined
    },
    { label: 'license', value: meta.license || 'MIT' },
    {
      label: 'showAsResourcePack',
      value: 'false',
      note: 'Must stay false, or Forge wraps the jar as a resource pack instead of reading data/.'
    },
    { label: 'credits', value: meta.credits?.trim() || 'Converted from a datapack' },
    { label: 'logoFile', value: icon },
    { label: 'displayURL', value: meta.homepage?.trim() || 'not written' },
    { label: 'issueTrackerURL', value: meta.issues?.trim() || 'not written' },
    { label: 'updateJSONURL', value: meta.updateJsonUrl?.trim() || 'not written' },
    {
      label: '[[mixins]]',
      value: 'none',
      locked: true,
      note: 'Mixins patch compiled Java; there is no code in this jar.'
    },
    {
      label: '[[dependencies]]',
      value: 'not written',
      locked: true,
      note: 'Nothing else needs installing. A wrong range here makes Forge hide the mod instead of failing loudly.'
    }
  ];
}

const Field: React.FC<{ field: DescriptorField }> = ({ field }) => (
  <div>
    <div className="flex items-center gap-1.5 label">
      {field.locked && <Lock className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{field.label}</span>
    </div>
    <div
      className={`mt-1 font-mono text-[11px] break-all ${
        field.locked ? 'text-faint' : 'text-paper'
      }`}
    >
      {field.value}
    </div>
    {field.note && (
      <div className="mt-1 text-[11px] text-muted leading-relaxed">{field.note}</div>
    )}
  </div>
);

export const DescriptorPanel: React.FC<MetadataEditorProps> = ({ metadata, onChange }) => {
  const [open, setOpen] = useState<DescriptorId | null>(null);
  const [copied, setCopied] = useState<DescriptorId | null>(null);

  const copy = async (id: DescriptorId) => {
    try {
      await navigator.clipboard.writeText(DESCRIPTOR_FILES[id].generate(metadata));
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // Clipboard blocked by the browser; the text is still on screen.
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-paper">Descriptor fields</h4>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            These two keys only exist in the Forge and NeoForge descriptors. Mod id, name, version,
            description, authors, license and links come from the General and Links tabs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label block mb-1.5">Credits</label>
            <input
              type="text"
              value={metadata.credits ?? ''}
              onChange={(e) => onChange({ ...metadata, credits: e.target.value })}
              placeholder="Converted from a datapack"
              className="w-full field px-3 py-2 text-xs text-paper placeholder:text-faint focus:outline-none"
            />
          </div>

          <div>
            <label className="label block mb-1.5">Update JSON URL</label>
            <input
              type="url"
              value={metadata.updateJsonUrl ?? ''}
              onChange={(e) => onChange({ ...metadata, updateJsonUrl: e.target.value })}
              placeholder="https://example.com/updates.json"
              className="w-full field px-3 py-2 font-mono text-[11px] text-paper placeholder:text-faint focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filesFor(metadata.loader).map((id) => {
          const file = DESCRIPTOR_FILES[id];
          const isOpen = open === id;
          return (
            <div key={id} className="panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 h-11 border-b border-rule">
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span className="text-xs font-medium text-paper">{file.loader}</span>
                  <span className="font-mono text-[11px] text-muted break-all">{file.path}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="inline-flex items-center gap-1.5 h-7 px-2 rounded border border-rule text-[11px] text-soft hover:text-paper hover:border-rule-strong transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    {isOpen ? 'Hide file' : 'View as file'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(id)}
                    aria-label={`Copy ${file.path}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded border border-rule text-muted hover:text-paper hover:border-rule-strong transition-colors"
                  >
                    {copied === id ? (
                      <Check className="w-3 h-3 text-signal-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 p-3.5">
                {factsFor(metadata, id).map((field) => (
                  <Field key={field.label} field={field} />
                ))}
              </div>

              {isOpen && (
                <pre className="max-h-80 overflow-auto border-t border-rule bg-ground px-3.5 py-3 font-mono text-[11px] leading-relaxed text-paper whitespace-pre">
                  {file.generate(metadata)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
