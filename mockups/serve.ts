const root = process.argv[2] || ".";
const port = Number(process.argv[3] || 8741);
const types: Record<string, string> = {
  html: "text/html", css: "text/css", js: "text/javascript", mjs: "text/javascript",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml",
  mp4: "video/mp4", webm: "video/webm", ico: "image/x-icon", json: "application/json",
};
const handlers = {
  async fetch(req: Request) {
    let path = decodeURIComponent(new URL(req.url).pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(`${root}${path}`);
    if (!(await file.exists())) return new Response("404", { status: 404 });
    const ext = path.split(".").pop() || "";
    const type = types[ext] || "application/octet-stream";
    const range = req.headers.get("range");
    if (range) {
      const m = range.match(/bytes=(\d*)-(\d*)/);
      const size = file.size;
      let start = m && m[1] ? parseInt(m[1]) : 0;
      let end = m && m[2] ? parseInt(m[2]) : size - 1;
      if (end >= size) end = size - 1;
      return new Response(file.slice(start, end + 1), {
        status: 206,
        headers: {
          "Content-Type": type,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(end - start + 1),
        },
      });
    }
    return new Response(file, { headers: { "Content-Type": type, "Accept-Ranges": "bytes" } });
  },
};

// Try the requested port, then fall back to the next few if it's already in use.
let server;
for (let p = port; p < port + 10; p++) {
  try {
    server = Bun.serve({ port: p, ...handlers });
    break;
  } catch (e: any) {
    if (e?.code !== "EADDRINUSE") throw e;
    console.log(`port ${p} in use, trying ${p + 1}...`);
  }
}
if (!server) throw new Error(`no free port in range ${port}-${port + 9}`);
console.log(`serving ${root} on http://localhost:${server.port}`);
