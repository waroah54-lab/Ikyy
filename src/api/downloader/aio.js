const axios = require("axios");

module.exports = function (app) {

  app.get("/download/aio", async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.json({
        status: false,
        creator: "Ikyy",
        message: "Masukkan parameter ?url="
      });
    }

    try {
      const api = await axios.get(
        `https://api.deline.web.id/downloader/aio?url=${encodeURIComponent(url)}`,
        { timeout: 15000 }
      );

      const d = api.data;

      if (!d.status || !d.result?.medias) {
        return res.json({
          status: false,
          creator: "Ikyy",
          message: "Gagal mengambil media!"
        });
      }

      // AMBIL DATA MEDIA, TAPI BIKIN FORMAT BARU SENDIRI
      const find = (q) => d.result.medias.find(m => m.quality === q);

      const output = {
        status: true,
        creator: "Ikyy",
        type: d.result.source || "unknown",

        info: {
          title: d.result.title || null,
          author: d.result.author || null,
          thumbnail: d.result.thumbnail || null,
        },

        video: {
          hd: find("hd_no_watermark")?.url || null,
          nowm: find("no_watermark")?.url || null,
          wm: find("watermark")?.url || null,
        },

        audio: find("audio")?.url || null
      };

      res.json(output);

    } catch (error) {
      res.json({
        status: false,
        creator: "Ikyy",
        message: error.message
      });
    }

  });

};
