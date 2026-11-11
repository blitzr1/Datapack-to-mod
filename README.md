# 📦 Minecraft Datapack to Mod Converter

A modern, high-performance web application that converts any Minecraft Datapack into a native Minecraft Mod JAR (`.jar`) with **100% editable metadata**, custom icons, multi-loader support (Universal, Fabric, NeoForge, Forge, Quilt), and live manifest previews.

Runs entirely **client-side** in your browser — zero file uploads, zero server latency, and complete privacy.

---

## ⚡ Features

### 🛠️ Full Metadata Control
- **Mod Display Name**: Set the in-game display name shown in ModMenu and crash reports.
- **Mod Identifier (Mod ID)**: Live syntax validation (lowercase alphanumeric, dashes, and underscores) with 1-click auto-fix.
- **Version**: Full semantic versioning support (e.g. `1.0.0`, `2.1.0-beta`).
- **Description**: Multi-line description field pre-filled from `pack.mcmeta` or customized freely.
- **Authors & Contributors**: Interactive tag editor to add or remove creators.
- **Software License**: Choose from standard licenses (MIT, Apache 2.0, GPLv3, LGPLv3, BSD-3, CC0, All Rights Reserved) or enter custom terms.
- **Links & Socials**: Homepage, GitHub/GitLab source code repository, and issue tracker URLs.

### 🧩 Multi-Loader Target Support
- **⚡ Universal All-in-One (Recommended)**: Packages `fabric.mod.json`, `quilt.mod.json`, `META-INF/neoforge.mods.toml`, `META-INF/mods.toml`, and `pack.mcmeta` into a single JAR that works on **all loaders** and can even be placed directly in a `datapacks/` folder!
- **🧵 Fabric**: Generates clean `fabric.mod.json` with `fabric-resource-loader` compatibility.
- **🔨 NeoForge**: Generates `META-INF/neoforge.mods.toml` for Minecraft 1.20.4+ and 1.21+.
- **⚒️ Forge**: Generates classic `META-INF/mods.toml` for Forge 1.16 - 1.20.1.
- **🪡 Quilt**: Generates `quilt.mod.json` for the Quilt loader ecosystem.

### 🎨 Custom Mod Icon Editor
- Extracts existing `pack.png` automatically as the mod logo.
- Upload any custom image (PNG, JPG, SVG, WEBP).
- Canvas auto-scaler and pixel-art preservation (128x128 standard).
- Built-in pixel presets: **Emerald**, **Diamond**, **Redstone**, **Tools / Pickaxe**, and **Storage / Chest**.

### 🔍 Interactive Datapack Inspector
- Live counters for `.mcfunction` files, recipes, tags, loot tables, advancements, predicates, and namespaces.
- Search and filter files in your datapack.
- Built-in file viewer to inspect `.mcfunction`, `.json`, `.mcmeta`, and image files without leaving the browser.
- Remove unwanted files prior to compilation.

### 📋 Live Manifest Inspector
- Real-time previews of generated descriptor files:
  - `fabric.mod.json`
  - `META-INF/neoforge.mods.toml`
  - `META-INF/mods.toml`
  - `quilt.mod.json`
  - `pack.mcmeta`
  - `META-INF/MANIFEST.MF`
- 1-click copy to clipboard.

### 🚀 Sample Datapacks Included
Test the application instantly without needing a `.zip` on hand:
1. **Timber & Vein Miner** (Scoreboard sneak detection, tree felling, custom sounds)
2. **Uncraftable Items & QoL Recipes** (Saddles, Name Tags, Horse Armor recipes)
3. **Sonic Elytra Boost** (Gliding sonic boom mechanic with feather detection)

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+) and npm

### Quick Start
1. Double-click **`start.bat`** (Windows)
   *or* run in your terminal:
   ```bash
   npm install
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Building for Production / Web Hosting
To create an optimized static build that can be hosted on GitHub Pages, Vercel, Netlify, or Cloudflare Pages:
```bash
npm run build
```
The compiled static website will be in the `dist/` directory.

---

## 🎮 How to Install the Generated Mod in Minecraft

1. Download the generated `.jar` file (e.g. `timber_axe-1.0.0.jar`).
2. Press `Win + R` and type:
   ```text
   %appdata%\.minecraft\mods
   ```
3. Copy your `.jar` file into the `mods` folder.
4. Launch Minecraft with your loader (**Fabric** + Fabric API, **NeoForge**, or **Forge**).
5. All datapack recipes, functions, and advancements are active automatically in all your worlds!
