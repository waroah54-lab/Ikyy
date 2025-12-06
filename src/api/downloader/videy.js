const axios = require('axios');

module.exports = function (app) {
    app.get('/download/videy', async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!url) return res.status(400).json({
            status: false,
            error: 'url is required'
        });

        try {
            // request ke API Hazel
            const result = await axios.get(
                "https://zelapioffciall.koyeb.app/download/videy",
                {
                    params: { url },
                    headers: { "User-Agent": "Mozilla/5.0" }
                }
            );

            const data = result.data;

            if (!data || !data.status) {
                return res.status(500).json({
                    status: false,
                    error: "Failed to fetch video URL"
                });
            }

            res.status(200).json({
                status: true,
                creator: "ikyy-officiall",
                video_url: data.video_url
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "ikyy-officiall",
                error: error.message
            });
        }
    });
};
