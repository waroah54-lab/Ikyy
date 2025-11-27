const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/bratv1', async (req, res) => {
        const { apikey, text } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!text) return res.status(400).json({
            status: false,
            error: 'text is required'
        });

        try {
            const { data } = await axios.get(`https://rynnhub-brat.hf.space/api/brat?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
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
