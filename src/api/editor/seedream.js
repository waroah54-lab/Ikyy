const axios = require("axios");

module.exports = function (app) {
  app.get("/edit/seedream", async (req, res) => {
    const prompt = req.query.prompt;
    const image = req.query.image;

    if (!prompt || !image) {
      return res.json({
        ok: false,
        developer: "Ikyy",
        message: "Masukkan parameter ?prompt= & ?image="
      });
    }

    try {
      // Request POST ke API resmi
      const api = await axios.post(
        "https://api.nekolabs.web.id/image-generation/seedream/v1",
        {
          prompt: prompt,
          imageUrl: image
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (!api.data.success) {
        return res.json({
          ok: false,
          developer: "Ikyy",
          message: "Gagal memproses gambar!"
        });
      }

      // Output JSON custom / beda total
      res.json({
        ok: true,
        developer: "Ikyy",
        request: {
          image: image,
          prompt: prompt
        },
        data: {
          image_result: api.data.result,
          category: "seedream",
          model: "seedream-v1"
        },
        meta: {
          server_time: api.data.timestamp,
          latency_ms: parseInt(api.data.responseTime)
        }
      });

    } catch (err) {
      res.json({
        ok: false,
        developer: "Ikyy",
        message: err.message || "Error tidak diketahui"
      });
    }
  });
};
