const axios = require("axios");

module.exports = function (app) {
  const sc = {
    helper: {
      prettyError(string) {
        const MAX_LENGTH = 200;
        const type = typeof string;
        if (type !== "string") return `(invalid type: ${type})`;
        if (!string) return "(empty message)";
        let msg = string;
        try {
          msg = JSON.stringify(JSON.parse(string), null, 2);
        } catch (_) {}
        if (msg.length > MAX_LENGTH)
          msg = msg.substring(0, MAX_LENGTH) + "...";
        return msg;
      }
    },

    static: {
      baseHeaders: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        origin: "https://savetwitter.net",
        referer: "https://savetwitter.net/id3"
      }
    },

    async twitter(url) {
      if (!url) throw new Error("url required");

      const r = await axios.post(
        "https://savetwitter.net/api/ajaxSearch",
        new URLSearchParams({
          q: url,
          lang: "id",
          cftoken: ""
        }),
        { headers: this.static.baseHeaders }
      ).catch(err => err.response);

      if (!r || r.status !== 200)
        throw new Error(
          `fetch failed ${r?.status} ${this.helper.prettyError(r?.data)}`
        );

      const h = r.data?.data;
      if (!h) throw new Error("data kosong");

      const mp4 = [...h.matchAll(
        /href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g
      )].map(x => ({
        quality: x[2],
        url: x[1]
      }));

      return {
        title: h.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || null,
        duration: h.match(/<p>(\d+:\d+)<\/p>/)?.[1] || null,
        thumbnail: h.match(/<img src="([^"]+)"/)?.[1] || null,
        mp4
      };
    }
  };

  /* =========================
     ROUTE EXPRESS
  ========================= */
  app.get("/download/twitterdl", async (req, res) => {
    const { apikey, url } = req.query;

    // cek apikey
    if (!apikey)
      return res.status(400).json({
        status: false,
        error: "apikey is required"
      });

    if (!global.apikey.includes(apikey))
      return res.status(403).json({
        status: false,
        error: "invalid apikey"
      });

    // cek url
    if (!url)
      return res.status(400).json({
        status: false,
        error: "url is required"
      });

    try {
      const data = await sc.twitter(url);

      res.json({
        status: true,
        creator: "Ikyy",
        result: data
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};
