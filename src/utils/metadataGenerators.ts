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

export function generateNeoForgeModsToml(meta: ModMetadata): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  const authorsStr = meta.authors.join(', ') || 'Anonymous';
  const cleanDescription = (meta.description || 'Converted from Minecraft Datapack').replace(/'''/g, "\\'\\'\\'");

  let side = 'BOTH';
  if (meta.environment === 'client_only') side = 'CLIENT';
  if (meta.environment === 'server_only') side = 'SERVER';

  return `modLoader="javafml"
loaderVersion="[1,)"
license="${meta.license || 'MIT'}"

[[mods]]
modId="${meta.modId}"
version="${meta.version || '1.0.0'}"
displayName="${meta.modName || meta.modId}"
description='''
${cleanDescription}
'''
authors="${authorsStr}"
${meta.homepage ? `displayURL="${meta.homepage}"` : ''}
logoFile="icon.png"

[[dependencies.${meta.modId}]]
modId="neoforge"
type="required"
versionRange="${versionInfo.neoforgeRange}"
ordering="NONE"
side="${side}"

[[dependencies.${meta.modId}]]
modId="minecraft"
type="required"
versionRange="${meta.customMcVersionRange?.trim() || `[${versionInfo.version},)`}"
ordering="NONE"
side="${side}"
`.trim();
}

export function generateForgeModsToml(meta: ModMetadata): string {
  const versionInfo = getVersionInfo(meta.targetMcVersion);
  const authorsStr = meta.authors.join(', ') || 'Anonymous';
  const cleanDescription = (meta.description || 'Converted from Minecraft Datapack').replace(/'''/g, "\\'\\'\\'");

  let side = 'BOTH';
  if (meta.environment === 'client_only') side = 'CLIENT';
  if (meta.environment === 'server_only') side = 'SERVER';

  return `modLoader="javafml"
loaderVersion="[36,)"
license="${meta.license || 'MIT'}"

[[mods]]
modId="${meta.modId}"
version="${meta.version || '1.0.0'}"
displayName="${meta.modName || meta.modId}"
description='''
${cleanDescription}
'''
authors="${authorsStr}"
${meta.homepage ? `displayURL="${meta.homepage}"` : ''}
logoFile="icon.png"

[[dependencies.${meta.modId}]]
modId="forge"
mandatory=true
versionRange="${versionInfo.forgeRange}"
ordering="NONE"
side="${side}"

[[dependencies.${meta.modId}]]
modId="minecraft"
mandatory=true
versionRange="${meta.customMcVersionRange?.trim() || `[${versionInfo.version},)`}"
ordering="NONE"
side="${side}"
`.trim();
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
