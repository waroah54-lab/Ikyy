const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/quotechat', async (req, res) => {
        const { apikey, text, name, profile } = req.query;

        // Validasi apikey
        if (!apikey) return res.status(400).json({ status: false, error: 'apikey is required' });
        if (!global.apikey || !global.apikey.includes(apikey)) return res.status(403).json({ status: false, error: 'invalid apikey' });

        // Validasi parameter wajib
        if (!text) return res.status(400).json({ status: false, error: 'text is required' });
        if (!name) return res.status(400).json({ status: false, error: 'name is required' });
        if (!profile) return res.status(400).json({ status: false, error: 'profile is required' });

        try {
            const { data } = await axios.get(
                `https://zelapioffciall.koyeb.app/canvas/quotechat?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&profile=${encodeURIComponent(profile)}`,
                { responseType: 'arraybuffer', timeout: 8000 }
            );

            // Kirim gambar langsung
            res.setHeader('Content-Type', 'image/png');
            res.send(Buffer.from(data)); // Lebih aman di Serverless daripada writeHead + end
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
}
