// Post-build step that copies the SSR server bundle next to the Vercel
// serverless entry so Vercel includes it in the deployed function.
//
// Vercel's filesystem trace only follows imports from files inside the
// `api/` directory, so we copy `dist/server` -> `api/_server` and rewrite
// the import in `api/index.js` to point there.
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = path.join(root, "dist", "server");
const dest = path.join(root, "api", "_server");

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

console.log(`[post-build] copied ${src} -> ${dest}`);
