const axios = require("axios");

module.exports = function(app) {
  app.get("/search/pinterest", async (req, res) => {
    const q = req.query.q;

    if (!q) {
      return res.json({
        status: false,
        creator: "Ikyy",
        message: "Masukkan parameter ?q="
      });
    }

    try {
      const api = await axios.get(`https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(q)}`);

      if (!api.data.status || !Array.isArray(api.data.data)) {
        return res.json({
          status: false,
          creator: "Ikyy",
          message: "Gagal mengambil data!"
        });
      }

      // SHUFFLE BIAR RANDOM
      const shuffle = arr => arr.sort(() => Math.random() - 0.5);

      const result = shuffle(api.data.data).map(v => ({
        id: v.id,
        title: v.caption || null,
        image_url: v.image,
        user: {
          username: v.uploader,
          name: v.fullname,
          followers: v.followers
        },
        source: v.source
      }));

      res.json({
        status: true,
        creator: "Ikyy",
        query: q,
        count: result.length,
        results: result
      });

    } catch(err) {
      res.json({
        status: false,
        creator: "Ikyy",
        message: err.message
      });
    }
  });
};
