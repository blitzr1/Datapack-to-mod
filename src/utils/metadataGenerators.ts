import type { ModMetadata } from '../types';
import { getVersionInfo, getVersionByPackFormat } from './packFormatMap';

// A pack's declared format says which client can load it; the target version
// string is only a UI choice and may not have its own row in the table.
export function minecraftRangeFor(meta: ModMetadata): string {
  if (meta.customMcVersionRange?.trim()) return meta.customMcVersionRange.trim();
  const info = meta.packFormat ? getVersionByPackFormat(meta.packFormat) : getVersionInfo(meta.targetMcVersion);
  return info.minecraftRange;
}

export function generateFabricModJson(meta: ModMetadata): string {
  const mcRange = minecraftRangeFor(meta);

  const contact: Record<string, string> = {};
  if (meta.homepage?.trim()) contact.homepage = meta.homepage.trim();
  if (meta.sources?.trim()) contact.sources = meta.sources.trim();
  if (meta.issues?.trim()) contact.issues = meta.issues.trim();

  let env = '*';
  if (meta.environment === 'client_only') env = 'client';
  if (meta.environment === 'server_only') env = 'server';

  const depends: Record<string, string> = {
    fabricloader: '>=0.15.0',
    minecraft: mcRange,
  };

  // fabric-api is a bundle; the resource loader is the module that actually
  // reads a datapack out of a mod jar.
  if (meta.requireResourceLoader) {
    depends['fabric-resource-loader-v0'] = '*';
  }

  const manifest = {
    schemaVersion: 1,
    id: meta.modId,
    version: meta.version || '1.0.0',
    name: meta.modName || meta.modId,
    description: meta.description || '',
    authors: meta.authors.length > 0 ? meta.authors : ['Anonymous'],
    contact: Object.keys(contact).length > 0 ? contact : undefined,
    license: meta.license || 'MIT',
    // Same rule as the TOML: never name an icon file the jar does not contain.
    icon: meta.iconDataUrl ? `assets/${meta.modId}/icon.png` : undefined,
    environment: env,
    depends
  };

  return JSON.stringify(manifest, null, 2);
}

// TOML basic strings take the same escapes as JSON, so one quoter is enough.
// Values are never spliced into a template: a mod name containing a quote used
// to produce an unparseable mods.toml and the loader silently dropped the mod.
const q = (value: string) => JSON.stringify(value);

function generateModsToml(meta: ModMetadata, loader: 'forge' | 'neoforge'): string {
  // A converted datapack has no Java in it, so Forge must be told to load it as
  // a low-code mod. "javafml" sends Forge looking for a @Mod class that is not
  // there. NeoForge has no low-code provider and accepts javafml for this.
  const modLoader = loader === 'forge' ? 'lowcodefml' : 'javafml';
  const loaderVersion = loader === 'forge' ? '[40,)' : '[1,)';

  const lines = [
    `modLoader=${q(modLoader)}`,
    `loaderVersion=${q(loaderVersion)}`,
    `license=${q(meta.license || 'MIT')}`,
    'showAsResourcePack=false',
    '',
    '[[mods]]',
    `modId=${q(meta.modId)}`,
    `version=${q(meta.version || '1.0.0')}`,
    `displayName=${q(meta.modName || meta.modId)}`,
    `description=${q(meta.description || 'Converted from Minecraft Datapack')}`,
    `authors=${q(meta.authors.join(', ') || 'Anonymous')}`,
    `credits=${q(meta.credits?.trim() || 'Converted from a datapack')}`
  ];

  // Only point at a logo the jar actually contains; a missing logoFile makes
  // Forge log a broken-image warning on every launch.
  if (meta.iconDataUrl) lines.push('logoFile="icon.png"');
  if (meta.homepage?.trim()) lines.push(`displayURL=${q(meta.homepage.trim())}`);
  if (meta.issues?.trim()) lines.push(`issueTrackerURL=${q(meta.issues.trim())}`);
  if (meta.updateJsonUrl?.trim()) lines.push(`updateJSONURL=${q(meta.updateJsonUrl.trim())}`);

  // No [[dependencies]] unless the user declares one: the loader and Minecraft
  // ranges this tool used to invent were wrong for every version it guessed.
  return lines.join('\n');
}

export function generateNeoForgeModsToml(meta: ModMetadata): string {
  return generateModsToml(meta, 'neoforge');
}

export function generateForgeModsToml(meta: ModMetadata): string {
  return generateModsToml(meta, 'forge');
}

export function generateQuiltModJson(meta: ModMetadata): string {
  // Quilt's parser reads one operator per constraint, so a space-separated
  // range becomes a single nonsense version and the mod is refused at load.
  // The lower bound is the part that matters; the upper half has to go.
  const mcRange = minecraftRangeFor(meta).split(/\s+/)[0];

  const contributors: Record<string, string> = {};
  meta.authors.forEach(author => {
    contributors[author] = 'Owner';
  });

  const depends = [
    {
      id: 'quilt_loader',
      versions: '>=0.20.0'
    },
    {
      id: 'minecraft',
      versions: mcRange
    }
  ];

  // Quilt Loader has no data pack loader of its own; Fabric API's module does
  // the reading through Quilt's Fabric compatibility layer.
  if (meta.requireResourceLoader) {
    depends.push({ id: 'fabric-resource-loader-v0', versions: '*' });
  }

  const contact: Record<string, string> = {};
  if (meta.homepage?.trim()) contact.homepage = meta.homepage.trim();
  if (meta.sources?.trim()) contact.sources = meta.sources.trim();
  if (meta.issues?.trim()) contact.issues = meta.issues.trim();

  const manifest = {
    schema_version: 1,
    quilt_loader: {
      group: `mod.${meta.modId}`,
      id: meta.modId,
      version: meta.version || '1.0.0',
      metadata: {
        name: meta.modName || meta.modId,
        description: meta.description || '',
        contributors: Object.keys(contributors).length > 0 ? contributors : { Anonymous: 'Owner' },
        contact: Object.keys(contact).length > 0 ? contact : undefined,
        license: meta.license || 'MIT',
        icon: meta.iconDataUrl ? 'icon.png' : undefined
      },
      intermediate_mappings: 'net.fabricmc:intermediary',
      depends
    }
  };

  return JSON.stringify(manifest, null, 2);
}

export function generatePackMcmeta(meta: ModMetadata, originalPackFormat?: number): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  // The source pack's own format is authoritative. Recomputing it from the game
  // version silently downgraded newer packs (71 -> 61) and dropped the range.
  const format = meta.packFormat ?? originalPackFormat ?? versionInfo.packFormat;

  const packObj: Record<string, unknown> = {
    pack_format: format,
    description: meta.description || meta.modName || 'Converted Minecraft Datapack Mod'
  };

  if (meta.supportedFormats) {
    packObj.supported_formats = meta.supportedFormats;
  }

  return JSON.stringify({ pack: packObj }, null, 2);
}

export function generateManifestMF(meta: ModMetadata): string {
  return [
    'Manifest-Version: 1.0',
    `Specification-Title: ${meta.modName || meta.modId}`,
    'Specification-Vendor: Datapack2Mod',
    'Specification-Version: 1',
    `Implementation-Title: ${meta.modId}`,
    `Implementation-Version: ${meta.version || '1.0.0'}`,
    `Implementation-Vendor: ${(meta.authors[0] || 'Minecraft Community')}`,
    ''
  ].join('\r\n');
}
