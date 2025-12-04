const axios = require('axios');

module.exports = function (app) {
    async function randomAsupan() {
        try {
            // Ambil URL video langsung dari API
            const { data } = await axios.get('https://api.deline.web.id/random/asupan', {
                responseType: 'json'
            });

            // Ambil video actual dari URL yang dikembalikan
            const videoResponse = await axios.get(data.url, { responseType: 'arraybuffer' });
            return Buffer.from(videoResponse.data);
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/asupan', async (req, res) => {
        const { apikey } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        try {
            const videoBuffer = await randomAsupan();
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': videoBuffer.length,
            });
            res.end(videoBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
