# 🚀 How to Deploy This Website Live on the Web

Your web app is now **100% production-ready** with SEO meta tags, Open Graph Discord/Twitter embeds, relative base asset resolution, PWA manifest, and optimized chunk splitting.

Here are the easiest free ways to publish it live on the internet:

---

## Option 1: Vercel (Recommended - Fastest & 1-Click)

The repository already includes [`vercel.json`](./vercel.json) pre-configured with caching and single-page routing!

### Method A: Using Git (Automated)
1. Push this folder to a GitHub repository.
2. Go to **[vercel.com](https://vercel.com)** and sign in.
3. Click **"Add New..."** → **"Project"** and import your repository.
4. Vercel will automatically detect Vite and run `npm run build`.
5. Click **"Deploy"** — your website is live with a free `*.vercel.app` URL and SSL certificate!

### Method B: Using Vercel CLI
Run this command in the project folder:
```bash
npx vercel
```
Follow the 3 prompts, and your site will be deployed in 20 seconds.

---

## Option 2: Netlify (Free Drag-and-Drop or Git)

The repository includes [`netlify.toml`](./netlify.toml) pre-configured with security headers and redirects.

### Method A: Instant Drag-and-Drop (No Git needed!)
1. Build the production files:
   ```bash
   npm run build
   ```
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**.
3. Drag and drop the **`dist`** folder from your computer into the browser.
4. Done! Netlify gives you an instant live URL (`*.netlify.app`).

---

## Option 3: GitHub Pages (100% Free)

Because [`vite.config.ts`](./vite.config.ts) uses `base: './'`, it works seamlessly on GitHub Pages subpaths!

1. Push this code to a repository on GitHub.
2. In your repository on GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub will automatically build and publish your site at `https://<username>.github.io/<repo-name>/`.

---

## Option 4: Cloudflare Pages

1. Log in to your Cloudflare dashboard and go to **Compute (Workers) > Workers & Pages** → **Create application** → **Pages**.
2. Connect your Git repository.
3. Set the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

## 🔒 Privacy & Serverless Architecture
Because this tool executes all zip decompression, manifest generation, and JAR assembly entirely inside the visitor's web browser using Web APIs and WebAssembly:
- **Zero server backend required** (can be hosted on any static CDN).
- **Unlimited free bandwidth**: Server hosting costs remain virtually zero regardless of whether you have 10 visitors or 1,000,000 visitors.
- **100% Client-Side Privacy**: Visitors' datapacks never touch any server.
