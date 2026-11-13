import { expect, test } from 'bun:test';
import JSZip from 'jszip';
import { parseDatapackZip } from '../src/utils/datapackParser';
import { buildModJar } from '../src/utils/jarBuilder';
import { generateFabricModJson, generateForgeModsToml, generateNeoForgeModsToml } from '../src/utils/metadataGenerators';
import type { ModMetadata } from '../src/types';

const baseMeta: ModMetadata = {
  modId: 'timber_vein',
  modName: "Bob's \"Timber\" Mod",
  version: '1.2.3-beta',
  description: "Fells trees.\nAlso has ''' in it \\ and a tab\there.",
  authors: ['Ann "Ace" O\'Neil'],
  license: 'MIT',
  homepage: 'https://example.com/?a=1&b=2',
  sources: '',
  issues: '',
  loader: 'universal',
  targetMcVersion: '1.20.1',
  customMcVersionRange: '>=1.20 <=1.20.1',
  environment: 'client_server',
  includePackMcmeta: true,
  requireResourceLoader: true,
  credits: 'Ported by Ann',
  updateJsonUrl: 'https://example.com/updates.json',
  packFormat: 71,
  supportedFormats: { min_inclusive: 71, max_inclusive: 81 },
  iconDataUrl: null
};

// Reads a TOML basic-string value the way a real parser would, so a bad escape
// fails here instead of in the loader's metadata list.
function basicValue(toml: string, key: string, table: string | null = '[[mods]]'): string[] {
  const out: string[] = [];
  let current: string | null = null;
  for (const line of toml.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[')) {
      current = trimmed;
      continue;
    }
    if (current !== table) continue;
    const match = trimmed.match(new RegExp(`^${key}=(.*)$`));
    if (match) out.push(JSON.parse(match[1]));
  }
  return out;
}

// Bytes that a UTF-8 round-trip cannot survive.
const blob = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff, 0xfe, 0x80, 0x81]);

async function makeDatapackZip(): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('pack.mcmeta', JSON.stringify({ pack: { pack_format: 15, description: 'test' } }));
  zip.file('data/timber/function/tick.mcfunction', 'say hi\n');
  zip.file('data/timber/note.bin', blob);
  zip.file('data/timber/thing.zip', blob);
  return new Uint8Array(await zip.generateAsync({ type: 'uint8array' }));
}

test('unknown extensions are parsed as binary, not decoded text', async () => {
  const parsed = await parseDatapackZip(new Blob([await makeDatapackZip()]), 'test.zip');

  for (const path of ['data/timber/note.bin', 'data/timber/thing.zip']) {
    const file = parsed.files.get(path);
    expect(file?.isBinary).toBe(true);
    expect(file?.raw && Array.from(file.raw)).toEqual(Array.from(blob));
  }

  expect(parsed.files.get('data/timber/function/tick.mcfunction')?.isBinary).toBe(false);
});

test('binary files survive the jar round-trip byte for byte', async () => {
  const parsed = await parseDatapackZip(new Blob([await makeDatapackZip()]), 'test.zip');
  const { blob: jar } = await buildModJar(parsed.files, baseMeta);
  const back = await JSZip.loadAsync(new Uint8Array(await jar.arrayBuffer()));

  for (const path of ['data/timber/note.bin', 'data/timber/thing.zip']) {
    const got = await back.file(path)?.async('uint8array');
    expect(got && Array.from(got)).toEqual(Array.from(blob));
  }
});

test('suggested mod id comes from the pack namespace, not the zip name', async () => {
  const zip = new JSZip();
  zip.file('pack.mcmeta', JSON.stringify({ pack: { pack_format: 71, description: 'Timber' } }));
  zip.file('data/timber/function/tick.mcfunction', 'say hi\n');
  zip.file('data/timber/recipe/planks.json', '{}');
  zip.file('data/minecraft/tags/function/load.json', '{}');

  const parsed = await parseDatapackZip(new Blob([new Uint8Array(await zip.generateAsync({ type: 'uint8array' }))]), 'datapack.zip');

  expect(parsed.suggestedMetadata.modId).toBe('timber');
  expect(parsed.suggestedMetadata.modName).toBe('Timber');
});

test('suggested mod id falls back to the zip name when only minecraft is used', async () => {
  const zip = new JSZip();
  zip.file('pack.mcmeta', JSON.stringify({ pack: { pack_format: 71, description: 'Tags only' } }));
  zip.file('data/minecraft/tags/function/load.json', '{}');

  const parsed = await parseDatapackZip(new Blob([new Uint8Array(await zip.generateAsync({ type: 'uint8array' }))]), 'fallback_pack.zip');

  expect(parsed.suggestedMetadata.modId).toBe('fallback_pack');
});

test('forge and neoforge toml round-trip hostile metadata', async () => {
  for (const toml of [generateForgeModsToml(baseMeta), generateNeoForgeModsToml(baseMeta)]) {
    expect(basicValue(toml, 'modId')).toEqual(['timber_vein']);
    expect(basicValue(toml, 'displayName')).toEqual([baseMeta.modName]);
    expect(basicValue(toml, 'description')).toEqual([baseMeta.description]);
    expect(basicValue(toml, 'authors')).toEqual([baseMeta.authors.join(', ')]);
    expect(basicValue(toml, 'credits')).toEqual(['Ported by Ann']);
    expect(basicValue(toml, 'updateJSONURL')).toEqual(['https://example.com/updates.json']);
    expect(basicValue(toml, 'license', null)).toEqual(['MIT']);
    // literal-string fences were the broken part; they must be gone
    expect(toml.split('\n').some(line => line.trim() === "'''")).toBe(false);
  }
});

test('forge is told low-code and neither toml invents dependencies', () => {
  const forge = generateForgeModsToml(baseMeta);
  // "javafml" makes Forge hunt for a @Mod class that a converted pack does not have.
  expect(basicValue(forge, 'modLoader', null)).toEqual(['lowcodefml']);
  expect(forge).toContain('showAsResourcePack=false');
  expect(forge.includes('[[dependencies')).toBe(false);

  const neo = generateNeoForgeModsToml(baseMeta);
  expect(basicValue(neo, 'modLoader', null)).toEqual(['javafml']);
  expect(neo.includes('[[dependencies')).toBe(false);
});

test('minecraft range follows the source pack format, not the label', () => {
  const fabric = JSON.parse(generateFabricModJson({ ...baseMeta, customMcVersionRange: undefined }));
  expect(fabric.depends.minecraft).toBe('>=1.21.5 <=1.21.8');
});

test('descriptors only name an icon the jar contains', () => {
  const noIcon = { ...baseMeta, iconDataUrl: null };
  expect(JSON.parse(generateFabricModJson(noIcon)).icon).toBeUndefined();
  expect(generateForgeModsToml(noIcon).includes('logoFile')).toBe(false);

  // 1x1 gif, enough for the generators to agree a file will be written.
  const withIcon = { ...baseMeta, iconDataUrl: 'data:image/png;base64,R0lGODlhAQABAAAAACw=' };
  expect(JSON.parse(generateFabricModJson(withIcon)).icon).toBe('assets/timber_vein/icon.png');
  expect(generateForgeModsToml(withIcon)).toContain('logoFile="icon.png"');
});

test('universal jar carries every loader manifest', async () => {
  const parsed = await parseDatapackZip(new Blob([await makeDatapackZip()]), 'test.zip');
  const { blob: jar, fileName } = await buildModJar(parsed.files, baseMeta);
  const back = await JSZip.loadAsync(new Uint8Array(await jar.arrayBuffer()));

  expect(fileName).toBe('timber_vein-1.2.3-beta.jar');
  for (const path of [
    'fabric.mod.json',
    'quilt.mod.json',
    'META-INF/mods.toml',
    'META-INF/neoforge.mods.toml',
    'META-INF/MANIFEST.MF',
    'pack.mcmeta'
  ]) {
    expect(back.file(path)).not.toBeNull();
  }

  const fabric = JSON.parse(await back.file('fabric.mod.json')!.async('string'));
  expect(fabric.id).toBe('timber_vein');
  expect(fabric.name).toBe(baseMeta.modName);
  expect(fabric.description).toBe(baseMeta.description);
  expect(fabric.authors).toEqual(baseMeta.authors);
  expect(fabric.depends.minecraft).toBe('>=1.20 <=1.20.1');
  // The bundle is not the module that reads a datapack out of a jar.
  expect(fabric.depends['fabric-resource-loader-v0']).toBe('*');
  expect(fabric.depends['fabric-api']).toBeUndefined();

  // The source format must survive packaging instead of being recomputed downward.
  const mcmeta = JSON.parse(await back.file('pack.mcmeta')!.async('string'));
  expect(mcmeta.pack.pack_format).toBe(71);
  expect(mcmeta.pack.supported_formats).toEqual({ min_inclusive: 71, max_inclusive: 81 });

  const quilt = JSON.parse(await back.file('quilt.mod.json')!.async('string'));
  expect(quilt.quilt_loader.id).toBe('timber_vein');
  expect(quilt.quilt_loader.metadata.contributors).toEqual({ [baseMeta.authors[0]]: 'Owner' });
  // Quilt parses only one operator per constraint; a space here = load failure.
  expect(quilt.quilt_loader.depends[1].versions).toBe('>=1.20');
  expect(quilt.quilt_loader.depends[2]).toEqual({ id: 'fabric-resource-loader-v0', versions: '*' });
});
