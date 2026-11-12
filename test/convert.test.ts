import { expect, test } from 'bun:test';
import JSZip from 'jszip';
import { parseDatapackZip } from '../src/utils/datapackParser';
import { buildModJar } from '../src/utils/jarBuilder';
import { generateForgeModsToml, generateNeoForgeModsToml } from '../src/utils/metadataGenerators';
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
  requireFabricApi: true,
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

test('forge and neoforge toml round-trip hostile metadata', async () => {
  for (const toml of [generateForgeModsToml(baseMeta), generateNeoForgeModsToml(baseMeta)]) {
    expect(basicValue(toml, 'modId')).toEqual(['timber_vein']);
    expect(basicValue(toml, 'displayName')).toEqual([baseMeta.modName]);
    expect(basicValue(toml, 'description')).toEqual([baseMeta.description]);
    expect(basicValue(toml, 'authors')).toEqual([baseMeta.authors.join(', ')]);
    expect(basicValue(toml, 'license', null)).toEqual(['MIT']);
    // literal-string fences were the broken part; they must be gone
    expect(toml.split('\n').some(line => line.trim() === "'''")).toBe(false);
  }
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

  const quilt = JSON.parse(await back.file('quilt.mod.json')!.async('string'));
  expect(quilt.quilt_loader.id).toBe('timber_vein');
  expect(quilt.quilt_loader.metadata.contributors).toEqual({ [baseMeta.authors[0]]: 'Owner' });
});
