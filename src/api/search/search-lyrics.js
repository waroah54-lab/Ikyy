const axios = require("axios");

module.exports = function (app) {

    async function lyricsSearch(title) {
        try {
            if (!title) throw new Error("Title is required");

            const { data } = await axios.get(
                `https://lrclib.net/api/search?q=${encodeURIComponent(title)}`,
                {
                    headers: {
                        referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
                        "user-agent":
                            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
                    },
                }
            );

            return data;

        } catch (err) {
            throw new Error(err.message);
        }
    }

    app.get("/search/lyrics", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey)
            return res.status(400).json({
                status: false,
                error: "apikey is required",
            });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({
                status: false,
                error: "invalid apikey",
            });

        if (!query)
            return res.status(400).json({
                status: false,
                error: "query is required",
            });

        try {
            const result = await lyricsSearch(query);

            res.status(200).json({
                status: true,
                creator: "IkyyOfficial",
                result,
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message,
            });
        }
    });
};
  
