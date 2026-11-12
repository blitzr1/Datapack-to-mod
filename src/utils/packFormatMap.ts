export interface VersionInfo {
  version: string;
  packFormat: number;
  // A pack built for the lower end of the group stays loadable up to this format.
  maxPackFormat?: number;
  label: string;
  minecraftRange: string;
}

// Datapack (data) formats, newest first. Values up to 26.3 are taken from the
// published Wither Ascension releases rather than guessed: 48 / 57-61 / 71-81 /
// 88-102 / 107-108 / 121.
export const MINECRAFT_VERSIONS: VersionInfo[] = [
  {
    version: '26.3',
    packFormat: 121,
    label: '26.3',
    minecraftRange: '>=26.3'
  },
  {
    version: '26.2',
    packFormat: 107,
    maxPackFormat: 108,
    label: '26.2',
    minecraftRange: '>=26.2 <26.3'
  },
  {
    version: '1.21.9',
    packFormat: 88,
    maxPackFormat: 102,
    label: '1.21.9 - 26.1.2',
    minecraftRange: '>=1.21.9 <=26.1.2'
  },
  {
    version: '1.21.5',
    packFormat: 71,
    maxPackFormat: 81,
    label: '1.21.5 - 1.21.8',
    minecraftRange: '>=1.21.5 <=1.21.8'
  },
  {
    version: '1.21.4',
    packFormat: 61,
    label: '1.21.4',
    minecraftRange: '>=1.21.4 <1.21.5'
  },
  {
    version: '1.21.2',
    packFormat: 57,
    maxPackFormat: 61,
    label: '1.21.2 - 1.21.4',
    minecraftRange: '>=1.21.2 <=1.21.4'
  },
  {
    version: '1.21',
    packFormat: 48,
    label: '1.21 - 1.21.1 (Tricky Trials)',
    minecraftRange: '>=1.21 <=1.21.1'
  },
  {
    version: '1.20.5',
    packFormat: 41,
    label: '1.20.5 - 1.20.6',
    minecraftRange: '>=1.20.5 <=1.20.6'
  },
  {
    version: '1.20.3',
    packFormat: 26,
    label: '1.20.3 - 1.20.4',
    minecraftRange: '>=1.20.3 <=1.20.4'
  },
  {
    version: '1.20',
    packFormat: 15,
    label: '1.20 - 1.20.1 (Trails & Tales)',
    minecraftRange: '>=1.20 <=1.20.1'
  },
  {
    version: '1.19.4',
    packFormat: 12,
    label: '1.19.4',
    minecraftRange: '>=1.19.4 <1.20'
  },
  {
    version: '1.19',
    packFormat: 10,
    label: '1.19 - 1.19.2 (The Wild Update)',
    minecraftRange: '>=1.19 <=1.19.2'
  },
  {
    version: '1.18.2',
    packFormat: 9,
    label: '1.18.2 (Caves & Cliffs II)',
    minecraftRange: '>=1.18.2 <1.19'
  },
  {
    version: '1.16.5',
    packFormat: 6,
    label: '1.16.5 (Nether Update)',
    minecraftRange: '>=1.16.5 <1.17'
  }
];

// Exact format wins, then the range a pack declares, then the closest known.
export function getVersionByPackFormat(format: number): VersionInfo {
  const exact = MINECRAFT_VERSIONS.find(v => v.packFormat === format);
  if (exact) return exact;

  const inRange = MINECRAFT_VERSIONS.find(
    v => v.maxPackFormat !== undefined && format > v.packFormat && format <= v.maxPackFormat
  );
  if (inRange) return inRange;

  const sorted = [...MINECRAFT_VERSIONS].sort(
    (a, b) => Math.abs(a.packFormat - format) - Math.abs(b.packFormat - format)
  );
  return sorted[0] || MINECRAFT_VERSIONS[0];
}

export function getVersionInfo(versionStr: string): VersionInfo {
  const exact = MINECRAFT_VERSIONS.find(v => v.version === versionStr);
  if (exact) return exact;

  // A patch version without its own row belongs to the row it starts with
  // (1.20.1 -> 1.20). Falling back to the newest row would mislabel old packs.
  const prefix = MINECRAFT_VERSIONS.find(v => versionStr.startsWith(v.version));
  return prefix || MINECRAFT_VERSIONS.find(v => v.packFormat === 48) || MINECRAFT_VERSIONS[0];
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
