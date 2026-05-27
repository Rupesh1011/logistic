// Vercel serverless function entry. The post-build script copies the SSR
// bundle into ./_server so Vercel includes it in the deployed function.
//
// The rewrites in vercel.json send every non-static request here.
import server from "./_server/server.js";

export default async function handler(request) {
  return server.fetch(request);
}

export const config = {
  runtime: "nodejs",
};
