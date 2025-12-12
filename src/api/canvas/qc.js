const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/quotechat', async (req, res) => {
        const { apikey, text, name, profile } = req.query;

        // Validasi apikey
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        // Validasi parameter wajib
        if (!text) return res.status(400).json({
            status: false,
            error: 'text is required'
        });

        if (!name) return res.status(400).json({
            status: false,
            error: 'name is required'
        });

        if (!profile) return res.status(400).json({
            status: false,
            error: 'profile is required'
        });

        try {
            // Panggil API eksternal
            const { data } = await axios.get(`https://zelapioffciall.koyeb.app/canvas/quotechat?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&profile=${encodeURIComponent(profile)}`, {
                responseType: 'arraybuffer'
            });

            // Kirim gambar langsung
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': data.length
            });
            res.end(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
          }
