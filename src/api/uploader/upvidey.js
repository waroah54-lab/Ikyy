const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mime = require("mime-types");
const os = require("os");

module.exports = function (app) {

  async function downloadTemp(url) {
    const ext = path.extname(new URL(url).pathname) || ".mp4";
    const tempPath = path.join(os.tmpdir(), `videy_${Date.now()}${ext}`);

    const response = await axios.get(url, {
      responseType: "stream"
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    return tempPath;
  }

  async function videyUploadFromUrl(fileUrl) {
    let tempFile;

    try {
      if (!fileUrl) throw new Error("url required");

      // download dulu
      tempFile = await downloadTemp(fileUrl);

      const mimeType = mime.lookup(tempFile) || "application/octet-stream";

      const form = new FormData();
      form.append(
        "file",
        fs.createReadStream(tempFile),
        {
          filename: path.basename(tempFile),
          contentType: mimeType
        }
      );

      const { data } = await axios.post(
        "https://videy.co/api/upload?visitorId=" + crypto.randomUUID(),
        form,
        {
          headers: {
            ...form.getHeaders(),
            "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
            origin: "https://videy.co",
            referer: "https://videy.co/",
            accept: "application/json"
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      return data;

    } catch (e) {
      throw new Error("VideyURL Error: " + e.message);
    } finally {
      // hapus file temp
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  // =========================
  // EXPRESS ROUTE
  // =========================
  app.get("/upload/videyurl", async (req, res) => {
    const { apikey, url } = req.query;

    if (!apikey)
      return res.status(400).json({ status: false, error: "apikey is required" });

    if (!global.apikey.includes(apikey))
      return res.status(403).json({ status: false, error: "invalid apikey" });

    if (!url)
      return res.status(400).json({ status: false, error: "url is required" });

    try {
      const result = await videyUploadFromUrl(url);

      res.json({
        status: true,
        result
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });

};
