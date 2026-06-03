export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: false, message: "No URL provided" });
  }

  try {
    const api = `https://karicine.netlify.app/.netlify/functions/scrapper?url=${url}`;
    const response = await fetch(api);
    const data = await response.json();

    const manual = data?.links?.manual;
    if (!manual) {
      return res.status(500).json({ status: false, message: "No manual link" });
    }

    const baseDownload = "https://cine-fix.vercel.app/api/download?url=";

    // filename + clean name
    let fileName = decodeURIComponent(manual.split("/").pop());
    const cleanName = fileName.replace(/(360p|480p|720p|1080p)/gi, "");

    const qualities = ["480p", "720p", "1080p"];

    // 🔥 Scan domains 01-45 for each quality
    async function findWorkingDomain(quality) {
      for (let i = 1; i <= 45; i++) {
        const num = String(i).padStart(2, "0");
        const domain = `https://${num}.yadev511.xyz/`;
        const testUrl = domain + cleanName.replace(".mp4", `${quality}.mp4`);

        try {
          const check = await fetch(testUrl, { method: "HEAD" });
          if (check.ok || check.status === 206) {
            return testUrl;
          }
        } catch (_) {
          // domain not responding, try next
        }
      }
      // fallback to 01 if nothing found
      return `https://01.yadev511.xyz/${cleanName.replace(".mp4", `${quality}.mp4`)}`;
    }

    // Run all quality checks in parallel
    const [url480, url720, url1080] = await Promise.all(
      qualities.map((q) => findWorkingDomain(q))
    );

    const direct = {
      "480p": url480,
      "720p": url720,
      "1080p": url1080,
    };

    const downloads = {
      "480p": baseDownload + encodeURIComponent(direct["480p"]),
      "720p": baseDownload + encodeURIComponent(direct["720p"]),
      "1080p": baseDownload + encodeURIComponent(direct["1080p"]),
    };

    return res.status(200).json({
      status: true,
      creator: "Chathura",
      title: data.title,
      downloads,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
