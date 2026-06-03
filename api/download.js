import fetch from "node-fetch";

globalThis.fetch = globalThis.fetch || fetch;

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  try {
    // 🔥 HEAD request先 - file size ganna
    let contentLength = null;
    try {
      const headRes = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://cinesubz.lk/",
          "Origin": "https://cinesubz.lk"
        }
      });
      contentLength = headRes.headers.get("content-length");
    } catch (_) {}

    // GET request
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://cinesubz.lk/",
        "Origin": "https://cinesubz.lk"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    // GET response ekenwath ganna - HEAD eken natha nam
    if (!contentLength) {
      contentLength = response.headers.get("content-length");
    }

    // filename clean
    let fileName = decodeURIComponent(url.split("/").pop() || "video.mp4");
    fileName = fileName
      .replace(/\s+/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/[^a-zA-Z0-9()._-]/g, "");
    fileName = `[Chdev]${fileName}`;

    // Headers
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
      res.setHeader("X-File-Size", contentLength);
    } else {
      res.setHeader("X-File-Size", "unknown");
    }

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, X-File-Size");

    // Stream
    response.body.pipe(res);

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).send("Server error");
  }
}