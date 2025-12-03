const axios = require('axios');

module.exports = function (app) {

    async function asupan() {
        try {
            const { data } = await axios.get(`https://api.deline.web.id/random/asupan`);

            if (!data || !data.url) throw new Error("Invalid response format");

            const response = await axios.get(data.url, { responseType: 'arraybuffer' });

            return {
                buffer: Buffer.from(response.data),
                type: response.headers['content-type'] || "video/mp4"
            };

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
            const result = await asupan();

            res.writeHead(200, {
                'Content-Type': result.type,
                'Content-Length': result.buffer.length,
            });

            res.end(result.buffer);

        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
