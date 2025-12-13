const axios = require("axios");

module.exports = function (app) {
  app.get("/edit/nanobanana", async (req, res) => {
    const { prompt, image } = req.query;

    if (!prompt || !image) {
      return res.json({
        success: false,
        creator: "Ikyy",
        message: "Parameter wajib: ?prompt= & ?image="
      });
    }

    const start = Date.now();

    try {
      const api = await axios.get(
        "https://api.nekolabs.web.id/image-generation/nano-banana/v6",
        {
          params: {
            prompt,
            imageUrl: image
          },
          timeout: 60000
        }
      );

      if (!api.data || !api.data.result) {
        return res.json({
          success: false,
          creator: "Ikyy",
          message: "Gagal generate gambar"
        });
      }

      return res.json({
        success: true,
        creator: "Ikyy",
        input: {
          prompt,
          image
        },
        result: api.data.result,
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - start}ms`
      });

    } catch (err) {
      return res.json({
        success: false,
        creator: "Ikyy",
        message: err.response?.data?.message || err.message
      });
    }
  });
};
