export type ModLoader = 'universal' | 'fabric' | 'neoforge' | 'forge' | 'quilt';

export type ModEnvironment = 'client_server' | 'client_only' | 'server_only';

export interface PackFormatRange {
  min_inclusive: number;
  max_inclusive: number;
}

export interface ModMetadata {
  modId: string;
  modName: string;
  version: string;
  description: string;
  authors: string[];
  license: string;
  homepage: string;
  sources: string;
  issues: string;
  loader: ModLoader;
  targetMcVersion: string;
  customMcVersionRange?: string;
  environment: ModEnvironment;
  includePackMcmeta: boolean;
  // The datapack needs fabric-resource-loader-v0 to be read from a mod jar.
  requireResourceLoader: boolean;
  // Real mods.toml fields; fabric.mod.json has no equivalent for either.
  credits?: string;
  updateJsonUrl?: string;
  // Carried over from the source pack so packaging never changes compatibility.
  packFormat?: number;
  supportedFormats?: PackFormatRange;
  iconDataUrl: string | null; // data URL or base64 PNG
}

export interface PackFile {
  path: string; // sanitized path inside root, e.g. 'data/namespace/functions/tick.mcfunction'
  size: number;
  isBinary: boolean;
  content?: string; // for text files
  raw?: Uint8Array; // raw binary
}

export interface DatapackSummary {
  packFormat: number;
  originalDescription: string;
  namespaces: string[];
  totalFiles: number;
  totalSize: number;
  counts: {
    functions: number;
    recipes: number;
    lootTables: number;
    tags: number;
    advancements: number;
    predicates: number;
    structures: number;
    worldgen: number;
    other: number;
  };
}

export interface SamplePack {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>; // path -> content
}
