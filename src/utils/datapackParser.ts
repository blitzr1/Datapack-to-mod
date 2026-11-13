import JSZip from 'jszip';
import type { PackFile, DatapackSummary, ModMetadata, PackFormatRange } from '../types';
import { getVersionByPackFormat } from './packFormatMap';

/**
 * Parses raw JSON description field which can be a string, object, or array
 */
export function extractPlainTextDescription(desc: any): string {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  if (Array.isArray(desc)) {
    return desc.map(item => extractPlainTextDescription(item)).join('');
  }
  if (typeof desc === 'object') {
    let str = desc.text || '';
    if (desc.extra) {
      str += extractPlainTextDescription(desc.extra);
    }
    return str;
  }
  return String(desc);
}

/**
 * Sanitizes mod name into a valid Minecraft Mod ID (a-z, 0-9, _, -)
 */
export function sanitizeModId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 64) || 'custom_mod';
}

export interface ParsedDatapackResult {
  files: Map<string, PackFile>;
  summary: DatapackSummary;
  suggestedMetadata: Partial<ModMetadata>;
  iconDataUrl: string | null;
}

export async function parseDatapackZip(file: File | Blob, rawName?: string): Promise<ParsedDatapackResult> {
  const zip = await JSZip.loadAsync(file);
  const fileEntries: { path: string; entry: JSZip.JSZipObject }[] = [];

  zip.forEach((relativePath, entry) => {
    if (!entry.dir) {
      fileEntries.push({ path: relativePath.replace(/\\/g, '/'), entry });
    }
  });

  return processPackEntries(fileEntries, rawName || (file instanceof File ? file.name : 'datapack'));
}

export async function parseDatapackFilesList(files: File[]): Promise<ParsedDatapackResult> {
  const entries: { path: string; file: File }[] = [];
  
  for (const f of files) {
    // webkitRelativePath contains folder structure if available
    const path = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
    entries.push({ path, file: f });
  }

  return processFileListEntries(entries);
}

async function processPackEntries(
  entries: { path: string; entry: JSZip.JSZipObject }[],
  sourceName: string
): Promise<ParsedDatapackResult> {
  // Determine if there is a common root directory
  const rootPrefix = detectCommonRootPrefix(entries.map(e => e.path));

  const filesMap = new Map<string, PackFile>();
  let packMcmetaText: string | null = null;
  let packPngBytes: Uint8Array | null = null;

  for (const item of entries) {
    let cleanPath = item.path;
    if (rootPrefix && cleanPath.startsWith(rootPrefix)) {
      cleanPath = cleanPath.slice(rootPrefix.length);
    }
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
    if (!cleanPath) continue;

    // Check if binary or text
    const isText = isTextFile(cleanPath);
    const raw = await item.entry.async('uint8array');
    let content: string | undefined = undefined;

    if (isText) {
      try {
        content = new TextDecoder('utf-8').decode(raw);
      } catch {
        content = undefined;
      }
    }

    filesMap.set(cleanPath, {
      path: cleanPath,
      size: raw.byteLength,
      isBinary: !isText,
      content,
      raw
    });

    if (cleanPath === 'pack.mcmeta' && isText && content) {
      packMcmetaText = content;
    } else if (cleanPath === 'pack.png') {
      packPngBytes = raw;
    }
  }

  return analyzeAndBuildResult(filesMap, packMcmetaText, packPngBytes, sourceName);
}

async function processFileListEntries(
  entries: { path: string; file: File }[]
): Promise<ParsedDatapackResult> {
  const rootPrefix = detectCommonRootPrefix(entries.map(e => e.path));
  const filesMap = new Map<string, PackFile>();

  let packMcmetaText: string | null = null;
  let packPngBytes: Uint8Array | null = null;

  for (const item of entries) {
    let cleanPath = item.path;
    if (rootPrefix && cleanPath.startsWith(rootPrefix)) {
      cleanPath = cleanPath.slice(rootPrefix.length);
    }
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
    if (!cleanPath) continue;

    const isText = isTextFile(cleanPath);
    const buffer = await item.file.arrayBuffer();
    const raw = new Uint8Array(buffer);
    let content: string | undefined = undefined;

    if (isText) {
      try {
        content = new TextDecoder('utf-8').decode(raw);
      } catch {
        content = undefined;
      }
    }

    filesMap.set(cleanPath, {
      path: cleanPath,
      size: raw.byteLength,
      isBinary: !isText,
      content,
      raw
    });

    if (cleanPath === 'pack.mcmeta' && isText && content) {
      packMcmetaText = content;
    } else if (cleanPath === 'pack.png') {
      packPngBytes = raw;
    }
  }

  const baseName = entries[0]?.file.name.replace(/\.[^/.]+$/, '') || 'datapack';
  return analyzeAndBuildResult(filesMap, packMcmetaText, packPngBytes, baseName);
}

function detectCommonRootPrefix(paths: string[]): string {
  // If pack.mcmeta or data/ is already at root level, no prefix to strip
  if (paths.some(p => p === 'pack.mcmeta' || p.startsWith('data/'))) {
    return '';
  }

  // Look for the directory containing 'pack.mcmeta' or 'data/'
  const metaPath = paths.find(p => p.endsWith('/pack.mcmeta') || p.includes('/data/'));
  if (metaPath) {
    const metaIndex = metaPath.indexOf('/pack.mcmeta');
    if (metaIndex !== -1) {
      return metaPath.substring(0, metaIndex + 1);
    }
    const dataIndex = metaPath.indexOf('/data/');
    if (dataIndex !== -1) {
      return metaPath.substring(0, dataIndex + 1);
    }
  }

  return '';
}

const TEXT_EXTENSIONS = ['.json', '.mcfunction', '.mcmeta', '.txt', '.md', '.toml', '.yaml', '.yml', '.properties', '.snbt'];

// Whitelist, not blacklist: guessing "text" for an unknown extension decodes binary
// bytes as UTF-8 and corrupts them on write-back.
function isTextFile(path: string): boolean {
  const lower = path.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function analyzeAndBuildResult(
  filesMap: Map<string, PackFile>,
  packMcmetaText: string | null,
  packPngBytes: Uint8Array | null,
  sourceName: string
): ParsedDatapackResult {
  let packFormat = 48; // default to 1.21
  let originalDescription = '';
  let supportedFormats: PackFormatRange | undefined;

  if (packMcmetaText) {
    try {
      const parsed = JSON.parse(packMcmetaText);
      if (parsed.pack) {
        if (typeof parsed.pack.pack_format === 'number') {
          packFormat = parsed.pack.pack_format;
        }
        if (parsed.pack.description) {
          originalDescription = extractPlainTextDescription(parsed.pack.description);
        }
        const range = parsed.pack.supported_formats;
        if (range && typeof range.min_inclusive === 'number' && typeof range.max_inclusive === 'number') {
          supportedFormats = { min_inclusive: range.min_inclusive, max_inclusive: range.max_inclusive };
        }
      }
    } catch (err) {
      console.warn('Failed to parse pack.mcmeta JSON', err);
    }
  }

  // Count namespaces and types of files
  const namespaceCounts = new Map<string, number>();
  const counts = {
    functions: 0,
    recipes: 0,
    lootTables: 0,
    tags: 0,
    advancements: 0,
    predicates: 0,
    structures: 0,
    worldgen: 0,
    other: 0,
  };

  let totalSize = 0;

  filesMap.forEach((file, path) => {
    totalSize += file.size;

    // Check namespace
    // Format: data/<namespace>/...
    const dataMatch = path.match(/^data\/([^/]+)\/(.+)$/);
    if (dataMatch) {
      const ns = dataMatch[1];
      const subPath = dataMatch[2];
      namespaceCounts.set(ns, (namespaceCounts.get(ns) ?? 0) + 1);

      if (subPath.startsWith('function') || subPath.endsWith('.mcfunction')) {
        counts.functions++;
      } else if (subPath.startsWith('recipe')) {
        counts.recipes++;
      } else if (subPath.startsWith('loot_table') || subPath.startsWith('loot_tables')) {
        counts.lootTables++;
      } else if (subPath.startsWith('tag') || subPath.startsWith('tags')) {
        counts.tags++;
      } else if (subPath.startsWith('advancement') || subPath.startsWith('advancements')) {
        counts.advancements++;
      } else if (subPath.startsWith('predicate') || subPath.startsWith('predicates')) {
        counts.predicates++;
      } else if (subPath.startsWith('structure') || subPath.startsWith('structures')) {
        counts.structures++;
      } else if (subPath.startsWith('worldgen')) {
        counts.worldgen++;
      } else {
        counts.other++;
      }
    } else {
      counts.other++;
    }
  });

  // Convert pack.png to data URL if present
  let iconDataUrl: string | null = null;
  if (packPngBytes) {
    try {
      // In browser, create base64
      let binary = '';
      const len = packPngBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(packPngBytes[i]);
      }
      iconDataUrl = `data:image/png;base64,${btoa(binary)}`;
    } catch (e) {
      console.warn('Could not convert pack.png to data URL', e);
    }
  }

  // Pack-internal identity beats the zip filename. A download named
  // "datapack.zip" should still suggest timber, not datapack.
  const primaryNamespace = [...namespaceCounts.entries()]
    .filter(([ns]) => ns !== 'minecraft')
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];

  const identitySource = primaryNamespace ?? sourceName;
  const rawCleanName = identitySource
    .replace(/\.zip$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  const modName = rawCleanName
    ? rawCleanName.charAt(0).toUpperCase() + rawCleanName.slice(1)
    : 'Converted Mod';

  const modId = sanitizeModId(modName);
  const versionInfo = getVersionByPackFormat(packFormat);

  return {
    files: filesMap,
    summary: {
      packFormat,
      originalDescription,
      namespaces: Array.from(namespaceCounts.keys()),
      totalFiles: filesMap.size,
      totalSize,
      counts
    },
    suggestedMetadata: {
      modId,
      modName,
      version: '1.0.0',
      description: originalDescription || `A Minecraft mod converted from ${modName} datapack.`,
      authors: ['Datapack Author'],
      license: 'MIT',
      homepage: '',
      sources: '',
      issues: '',
      loader: 'universal',
      targetMcVersion: versionInfo.version,
      environment: 'client_server',
      includePackMcmeta: true,
      requireResourceLoader: true,
      packFormat,
      supportedFormats,
      iconDataUrl
    },
    iconDataUrl
  };
}
