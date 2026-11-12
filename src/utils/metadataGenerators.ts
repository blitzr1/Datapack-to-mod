import type { ModMetadata } from '../types';
import { getVersionInfo } from './packFormatMap';

export function generateFabricModJson(meta: ModMetadata): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  const mcRange = meta.customMcVersionRange?.trim() || versionInfo.fabricMinecraftRange;

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

  if (meta.requireFabricApi) {
    depends['fabric-api'] = '*';
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
    icon: `assets/${meta.modId}/icon.png`,
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
  const versionInfo = getVersionInfo(meta.targetMcVersion);

  let side = 'BOTH';
  if (meta.environment === 'client_only') side = 'CLIENT';
  if (meta.environment === 'server_only') side = 'SERVER';

  // Forge marks required deps with a boolean, NeoForge with a string.
  const required = loader === 'forge' ? 'mandatory=true' : 'type="required"';
  const loaderVersion = loader === 'forge' ? '[36,)' : '[1,)';
  const loaderRange = loader === 'forge' ? versionInfo.forgeRange : versionInfo.neoforgeRange;

  const lines = [
    `modLoader="javafml"`,
    `loaderVersion=${q(loaderVersion)}`,
    `license=${q(meta.license || 'MIT')}`,
    '',
    '[[mods]]',
    `modId=${q(meta.modId)}`,
    `version=${q(meta.version || '1.0.0')}`,
    `displayName=${q(meta.modName || meta.modId)}`,
    `description=${q(meta.description || 'Converted from Minecraft Datapack')}`,
    `authors=${q(meta.authors.join(', ') || 'Anonymous')}`
  ];

  if (meta.homepage?.trim()) lines.push(`displayURL=${q(meta.homepage.trim())}`);

  lines.push(
    'logoFile="icon.png"',
    '',
    `[[dependencies.${meta.modId}]]`,
    `modId=${q(loader)}`,
    required,
    `versionRange=${q(loaderRange)}`,
    'ordering="NONE"',
    `side=${q(side)}`,
    '',
    `[[dependencies.${meta.modId}]]`,
    'modId="minecraft"',
    required,
    `versionRange=${q(meta.customMcVersionRange?.trim() || `[${versionInfo.version},)`)}`,
    'ordering="NONE"',
    `side=${q(side)}`
  );

  return lines.join('\n');
}

export function generateNeoForgeModsToml(meta: ModMetadata): string {
  return generateModsToml(meta, 'neoforge');
}

export function generateForgeModsToml(meta: ModMetadata): string {
  return generateModsToml(meta, 'forge');
}

export function generateQuiltModJson(meta: ModMetadata): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  const mcRange = meta.customMcVersionRange?.trim() || versionInfo.fabricMinecraftRange;

  const contributors: Record<string, string> = {};
  meta.authors.forEach(author => {
    contributors[author] = 'Owner';
  });

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
        icon: 'icon.png'
      },
      intermediate_mappings: 'net.fabricmc:intermediary',
      depends: [
        {
          id: 'quilt_loader',
          versions: '>=0.20.0'
        },
        {
          id: 'minecraft',
          versions: mcRange
        }
      ]
    }
  };

  return JSON.stringify(manifest, null, 2);
}

export function generatePackMcmeta(meta: ModMetadata, originalPackFormat?: number): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  const format = originalPackFormat || versionInfo.packFormat;

  const packObj = {
    pack: {
      pack_format: format,
      description: meta.description || meta.modName || 'Converted Minecraft Datapack Mod'
    }
  };

  return JSON.stringify(packObj, null, 2);
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
