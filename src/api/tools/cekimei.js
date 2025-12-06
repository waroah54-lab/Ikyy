const axios = require('axios');

module.exports = function (app) {
    app.get('/tools/imei', async (req, res) => {
        const { apikey, imei } = req.query;

        // Cek apikey
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        // Cek imei
        if (!imei) return res.status(400).json({
            status: false,
            error: 'imei is required'
        });

        try {
            // Request ke API Nekolabs
            const result = await axios.get(
                "https://api.nekolabs.web.id/tools/imei-info",
                {
                    params: { imei },
                    headers: { "User-Agent": "Mozilla/5.0" }
                }
            );

            // Jika gagal / tidak ada result
            if (!result.data || result.data.success !== true) {
                return res.status(500).json({
                    status: false,
                    error: "Failed to fetch IMEI data"
                });
            }

            // Kirim ulang ke client
            res.status(200).json({
                status: true,
                result: result.data.result,
                timestamp: result.data.timestamp,
                responseTime: result.data.responseTime
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};
