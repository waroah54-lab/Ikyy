const axios = require("axios");

module.exports = function(app) {
  app.get("/edit/tofigure", async (req, res) => {
    const image = req.query.image;

    if (!image) {
      return res.json({
        status: false,
        creator: "Ikyy",
        message: "Masukkan parameter ?image="
      });
    }

    try {

      const api = await axios.get(
        `https://api.baguss.xyz/api/edits/tofigure?image=${encodeURIComponent(image)}`
      );

      if (!api.data.success) {
        return res.json({
          status: false,
          creator: "Ikyy",
          message: "Gagal memproses gambar!"
        });
      }

      // Output baru (berbeda!)
      res.json({
        status: true,
        creator: "Ikyy",
        source_image: image,
        generated: {
          url: api.data.result,
          type: "figure-art",
          provider: "ikyyxy"
        }
      });

    } catch (err) {
      res.json({
        status: false,
        creator: "Ikyy",
        message: err.message
      });
    }
  });
};
