# Datapack to Mod Converter

Turns a Minecraft datapack zip into a mod jar, in the browser. The archive is read from memory, never uploaded, and every payload file is copied into the jar byte for byte. Only loader descriptors and an optional icon are added.

Output jars have been loaded in game on Fabric 1.21.5, Quilt 0.30.2, Forge 55.1.18, and NeoForge 21.5.101.

## What it does

- Reads a `.zip` datapack, or an unzipped folder via the folder picker.
- Copies every payload entry as-is, including binary assets such as `pack.png` and custom textures.
- Writes descriptors for one loader or all four at once.
- Keeps `pack.mcmeta`'s `pack_format` and `supported_formats` instead of guessing a version.
- Edits real descriptor fields before building: name, id, version, description, authors, license, links, credits, update JSON.
- Shows the generated descriptors with copy-to-clipboard.
- Inspects the payload: counts by type, search, text and image preview, per-file removal.

No account, no backend, no analytics. The built site is static files.

## Loader targets

| Target | Files written |
| --- | --- |
| Universal | `fabric.mod.json`, `quilt.mod.json`, `META-INF/mods.toml`, `META-INF/neoforge.mods.toml` |
| Fabric | `fabric.mod.json` |
| Quilt | `quilt.mod.json` |
| Forge | `META-INF/mods.toml` |
| NeoForge | `META-INF/neoforge.mods.toml` |

Forge is emitted as `lowcodefml` so a datapack-only jar needs no Java class. NeoForge is emitted as `javafml` for 1.20.4 and newer. By default the Fabric and Quilt descriptors declare the `fabric-resource-loader-v0` dependency, which means Fabric API must be installed alongside the jar. The dependency can be turned off under Advanced if the pack ships its own loader.

## Why a jar works

A mod loader reads `data/` from any jar on its classpath and registers it as a built-in datapack. The generated jar carries the original payload plus the descriptor the chosen loader needs to accept it, so functions, recipes, tags, advancements, loot tables, and structures apply to every world once the mod is installed.

## Getting started

Node 18+ and npm.

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. On Windows, `start.bat` runs the install, opens that URL, and starts the dev server.

### Build

```bash
npm run build
```

The static site lands in `dist/`. It works on GitHub Pages, Netlify, Vercel, and Cloudflare Pages; `vercel.json` and `netlify.toml` are already configured. See `DEPLOYMENT.md` for provider-specific steps.

### Test and lint

```bash
npm test
npm run lint
```

The test suite runs under Bun.

## Installing the generated jar

1. Download the jar.
2. Put it in the `mods` folder of the instance. For the default Windows launcher that is `%appdata%\.minecraft\mods`.
3. Start the loader you targeted. For Fabric and Quilt, install Fabric API in `mods` first.
4. Check the mod list or the loader log if the pack does not appear.

## Limits

- Input is a datapack zip or folder. Other containers are not accepted.
- The tool packages data. It does not convert datapack behavior that requires Java code.
- `pack.mcmeta` keeps the source format range. If that range is wrong for your game version, fix the pack before converting.
- Code-only descriptor fields (`entrypoints`, `mixins`, `accessWidener`, `[[dependencies]]`) are locked on purpose.
- Loading is tested on the four loader versions listed above. Other versions are untested.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, JSZip. No server code.

Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
