// Vercel serverless function entry (Node.js runtime).
//
// Vercel's Node.js runtime gives us classic Express-style (req, res) handlers.
// Our TanStack Start SSR bundle exports a Web Fetch–style handler instead, so
// this file converts between the two: build a Web Request from the IncomingMessage,
// pass it to server.fetch(), then stream the Response back into ServerResponse.
import server from "./_server/server.js";

export default async function handler(req, res) {
  try {
    const protocol =
      (req.headers["x-forwarded-proto"] && String(req.headers["x-forwarded-proto"]).split(",")[0]) ||
      "https";
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `${protocol}://${host}`);

    // Drain the request body if there is one (POST etc.) before constructing
    // the Web Request, since Node's IncomingMessage is a stream.
    const method = (req.method || "GET").toUpperCase();
    let body;
    if (method !== "GET" && method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        body = Buffer.concat(chunks);
      }
    }

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) {
        for (const item of v) headers.append(k, String(item));
      } else if (v !== undefined) {
        headers.set(k, String(v));
      }
    }

    const webRequest = new Request(url.toString(), {
      method,
      headers,
      body,
      duplex: body ? "half" : undefined,
    });

    const response = await server.fetch(webRequest);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      // Skip headers Node sets itself or that don't make sense in Node land.
      if (key === "content-length" || key === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    } else {
      const text = await response.text();
      if (text) res.write(text);
    }
    res.end();
  } catch (error) {
    console.error("[api/index] handler crashed:", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal server error");
  }
}

export const config = {
  runtime: "nodejs",
};
