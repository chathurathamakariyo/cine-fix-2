import fetch from "node-fetch";

globalThis.fetch = globalThis.fetch || fetch;

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  try {
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

    // 🔥 Full buffer - size exact danna
    const buffer = await response.buffer();
    const fileSize = buffer.length;

    // filename clean
    let fileName = decodeURIComponent(url.split("/").pop() || "video.mp4");
    fileName = fileName
      .replace(/\s+/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/[^a-zA-Z0-9()._-]/g, "");
    fileName = `[Chdev]${fileName}`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", fileSize);
    res.setHeader("X-File-Size", fileSize);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, X-File-Size");

    res.send(buffer);

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).send("Server error");
  }
}