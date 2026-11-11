export interface VersionInfo {
  version: string;
  packFormat: number;
  label: string;
  fabricMinecraftRange: string;
  neoforgeRange: string;
  forgeRange: string;
}

export const MINECRAFT_VERSIONS: VersionInfo[] = [
  {
    version: '1.21.4',
    packFormat: 61,
    label: '1.21.4 (Latest)',
    fabricMinecraftRange: '>=1.21.4',
    neoforgeRange: '[21.4.0,)',
    forgeRange: '[54.0.0,)'
  },
  {
    version: '1.21.2',
    packFormat: 57,
    label: '1.21.2 - 1.21.3',
    fabricMinecraftRange: '>=1.21.2 <=1.21.3',
    neoforgeRange: '[21.2.0,21.4.0)',
    forgeRange: '[53.0.0,)'
  },
  {
    version: '1.21',
    packFormat: 48,
    label: '1.21 - 1.21.1 (Tricky Trials)',
    fabricMinecraftRange: '>=1.21 <=1.21.1',
    neoforgeRange: '[21.0.0,21.2.0)',
    forgeRange: '[51.0.0,52.0.0)'
  },
  {
    version: '1.20.6',
    packFormat: 41,
    label: '1.20.5 - 1.20.6',
    fabricMinecraftRange: '>=1.20.5 <=1.20.6',
    neoforgeRange: '[20.6.0,21.0.0)',
    forgeRange: '[50.0.0,51.0.0)'
  },
  {
    version: '1.20.4',
    packFormat: 26,
    label: '1.20.3 - 1.20.4',
    fabricMinecraftRange: '>=1.20.3 <=1.20.4',
    neoforgeRange: '[20.4.0,20.5.0)',
    forgeRange: '[49.0.0,50.0.0)'
  },
  {
    version: '1.20.1',
    packFormat: 15,
    label: '1.20 - 1.20.1 (Trails & Tales)',
    fabricMinecraftRange: '>=1.20 <=1.20.1',
    neoforgeRange: '[20.1.0,20.2.0)',
    forgeRange: '[47.0.0,48.0.0)'
  },
  {
    version: '1.19.4',
    packFormat: 12,
    label: '1.19.4',
    fabricMinecraftRange: '>=1.19.4',
    neoforgeRange: '[1.19.4,)',
    forgeRange: '[45.0.0,46.0.0)'
  },
  {
    version: '1.19.2',
    packFormat: 10,
    label: '1.19 - 1.19.2 (The Wild Update)',
    fabricMinecraftRange: '>=1.19 <=1.19.2',
    neoforgeRange: '[1.19,)',
    forgeRange: '[43.0.0,44.0.0)'
  },
  {
    version: '1.18.2',
    packFormat: 9,
    label: '1.18.2 (Caves & Cliffs II)',
    fabricMinecraftRange: '>=1.18.2',
    neoforgeRange: '[1.18.2,)',
    forgeRange: '[40.0.0,41.0.0)'
  },
  {
    version: '1.16.5',
    packFormat: 6,
    label: '1.16.5 (Nether Update)',
    fabricMinecraftRange: '>=1.16.5',
    neoforgeRange: '[1.16.5,)',
    forgeRange: '[36.0.0,37.0.0)'
  }
];

export function getVersionByPackFormat(format: number): VersionInfo {
  // Find exact or closest version
  const exact = MINECRAFT_VERSIONS.find(v => v.packFormat === format);
  if (exact) return exact;

  // Find nearest
  const sorted = [...MINECRAFT_VERSIONS].sort((a, b) => 
    Math.abs(a.packFormat - format) - Math.abs(b.packFormat - format)
  );
  return sorted[0] || MINECRAFT_VERSIONS[0];
}

export function getVersionInfo(versionStr: string): VersionInfo {
  const found = MINECRAFT_VERSIONS.find(v => v.version === versionStr);
  return found || MINECRAFT_VERSIONS[0];
}

export const COMMON_LICENSES = [
  { id: 'MIT', name: 'MIT License' },
  { id: 'Apache-2.0', name: 'Apache License 2.0' },
  { id: 'GPL-3.0', name: 'GNU General Public License v3.0' },
  { id: 'LGPL-3.0', name: 'GNU Lesser General Public License v3.0' },
  { id: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License' },
  { id: 'CC0-1.0', name: 'Creative Commons Zero v1.0 Universal (Public Domain)' },
  { id: 'CC-BY-4.0', name: 'Creative Commons Attribution 4.0' },
  { id: 'CC-BY-NC-4.0', name: 'Creative Commons Attribution-NonCommercial 4.0' },
  { id: 'All Rights Reserved', name: 'All Rights Reserved (ARR)' },
  { id: 'Custom', name: 'Custom / Other' },
];
