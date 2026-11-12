import JSZip from 'jszip';
import type { ModMetadata, PackFile } from '../types';
import {
  generateFabricModJson,
  generateNeoForgeModsToml,
  generateForgeModsToml,
  generateQuiltModJson,
  generatePackMcmeta,
  generateManifestMF
} from './metadataGenerators';

export async function buildModJar(
  files: Map<string, PackFile>,
  meta: ModMetadata,
  onProgress?: (percent: number, status: string) => void
): Promise<{ blob: Blob; fileName: string; size: number }> {
  const zip = new JSZip();

  onProgress?.(10, 'Initializing JAR package...');

  // 1. Add all existing datapack/mod files
  let processed = 0;
  const totalFiles = files.size;

  files.forEach((file, relativePath) => {
    // If we're updating pack.mcmeta and includePackMcmeta is on, we'll write our own
    if (relativePath === 'pack.mcmeta' && meta.includePackMcmeta) {
      return;
    }

    // raw bytes are the source of truth; a decoded string can have lost bytes
    if (file.raw) {
      zip.file(relativePath, file.raw);
    } else if (file.content !== undefined) {
      zip.file(relativePath, file.content);
    }

    processed++;
    if (processed % 15 === 0 && onProgress) {
      const progress = 10 + Math.floor((processed / totalFiles) * 50);
      onProgress(progress, `Packing ${relativePath}...`);
    }
  });

  onProgress?.(65, 'Generating mod manifests & loader definitions...');

  // 2. Generate Manifests based on loader choice
  const isUniversal = meta.loader === 'universal';

  if (isUniversal || meta.loader === 'fabric') {
    zip.file('fabric.mod.json', generateFabricModJson(meta));
  }

  if (isUniversal || meta.loader === 'neoforge') {
    zip.file('META-INF/neoforge.mods.toml', generateNeoForgeModsToml(meta));
  }

  if (isUniversal || meta.loader === 'forge') {
    zip.file('META-INF/mods.toml', generateForgeModsToml(meta));
  }

  if (isUniversal || meta.loader === 'quilt') {
    zip.file('quilt.mod.json', generateQuiltModJson(meta));
  }

  // 3. Add MANIFEST.MF
  zip.file('META-INF/MANIFEST.MF', generateManifestMF(meta));

  // 4. Add updated pack.mcmeta if requested
  if (meta.includePackMcmeta) {
    zip.file('pack.mcmeta', generatePackMcmeta(meta));
  }

  // 5. Handle Icon
  if (meta.iconDataUrl) {
    try {
      const base64Data = meta.iconDataUrl.split(',')[1];
      if (base64Data) {
        const iconBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Root icon.png for Forge / NeoForge / Quilt
        zip.file('icon.png', iconBytes);

        // assets/<modid>/icon.png for Fabric
        zip.file(`assets/${meta.modId}/icon.png`, iconBytes);

        // Also pack.png at root so it looks good if loaded as datapack
        zip.file('pack.png', iconBytes);
      }
    } catch (e) {
      console.warn('Failed to encode icon into jar', e);
    }
  }

  onProgress?.(80, 'Compressing JAR archive...');

  // 6. Generate final JAR
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      mimeType: 'application/java-archive',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      onProgress?.(80 + Math.floor(metadata.percent * 0.19), `Finalizing: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'JAR compilation complete!');

  const fileName = `${meta.modId}-${meta.version || '1.0.0'}.jar`;

  return {
    blob,
    fileName,
    size: blob.size
  };
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
