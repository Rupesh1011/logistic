// Vite config powered by the Lovable preset, but targeting Vercel (not Cloudflare).
// The preset bundles the Cloudflare plugin only when `cloudflare !== false`, so
// disabling it here leaves us with a vanilla TanStack Start build that Vercel
// auto-detects and deploys as a serverless function.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
});
