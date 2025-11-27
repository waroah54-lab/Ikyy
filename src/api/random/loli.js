const axios = require('axios');

module.exports = function (app) {
    async function loli() {
        try {
            const { data } = await axios.get(`https://raw.githubusercontent.com/rynn-k/loli-r-img/refs/heads/main/links.json`);
            const response = await axios.get(data[Math.floor(data.length * Math.random())], { responseType: 'arraybuffer' })
            return Buffer.from(response.data);
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/loli', async (req, res) => {
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
            const imageBuffer = await loli();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
