const multer = require("multer");
const axios = require("axios");
const fetch = require("node-fetch");

const upload = multer();

// Generate nama random
function randomName(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

module.exports = function (app) {

  app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.json({
        status: false,
        creator: "Ikyy",
        message: "Masukkan file lewat form-data field 'file'."
      });
    }

    // Validasi jpg/png
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.json({
        status: false,
        creator: "Ikyy",
        message: "File harus berformat jpg/jpeg/png!"
      });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const filename = `${randomName(8)}.${ext}`;

    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO  = process.env.GITHUB_REPO;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const BASE_URL     = process.env.BASE_URL;

    try {
      const buffer = req.file.buffer;
      const filePath = `upload/${filename}`;

      // Upload ke GitHub
      const uploadGitHub = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "IkyyUploader"
          },
          body: JSON.stringify({
            message: `Upload ${filename}`,
            content: buffer.toString("base64")
          })
        }
      );

      if (!uploadGitHub.ok) {
        return res.json({
          status: false,
          creator: "Ikyy",
          message: "Gagal upload ke GitHub!"
        });
      }

      // URL akhir dari BASE_URL → fallback ke req.protocol/host jika kosong
      const finalBase = BASE_URL || `${req.protocol}://${req.get("host")}`;
      const finalUrl = `${finalBase}/upload/${filename}`;

      res.json({
        status: true,
        creator: "Ikyy",
        filename_random: filename,
        url: finalUrl
      });

    } catch (err) {
      res.json({
        status: false,
        creator: "Ikyy",
        message: err.message
      });
    }
  });



  // FILE READER
  app.get("/upload/:filename", async (req, res) => {
    const filename = req.params.filename;

    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO  = process.env.GITHUB_REPO;

    const rawURL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/upload/${filename}`;

    try {
      const file = await axios.get(rawURL, { responseType: "arraybuffer" });

      let mime = "image/jpeg";
      if (filename.endsWith(".png")) mime = "image/png";

      res.setHeader("Content-Type", mime);
      res.send(file.data);

    } catch (err) {
      res.json({
        status: false,
        creator: "Ikyy",
        message: "File tidak ditemukan."
      });
    }
  });

};
