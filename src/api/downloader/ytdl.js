const axios = require("axios");

module.exports = function (app) {
    app.get("/download/play", async (req, res) => {
        const { apikey, query } = req.query;

        // VALIDASI APIKEY
        if (!apikey) return res.status(400).json({
            status: false,
            error: "apikey is required"
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: "invalid apikey"
        });

        // VALIDASI QUERY
        if (!query) return res.status(400).json({
            status: false,
            error: "query is required"
        });

        try {
            // REQUEST KE API SESUAI YANG KAMU BERIKAN
            const response = await axios.get(
                `https://api.zenzxz.my.id/api/search/play?query=${encodeURIComponent(query)}`
            );

            const anu = response.data;

            // CEK STATUS
            if (!anu.success || !anu.data) {
                return res.status(404).json({
                    status: false,
                    error: "lagu tidak ditemukan, coba kata kunci lain."
                });
            }

            // PARSE DATA SESUAI RESPONSE
            const result = {
                title: anu.data.metadata.title,
                duration: anu.data.metadata.duration,
                thumbnail: anu.data.metadata.thumbnail,
                id: anu.data.metadata.id,
                mp3: anu.data.dl_mp3,
                mp4: anu.data.dl_mp4
            };

            res.status(200).json({
                status: true,
                result
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};
