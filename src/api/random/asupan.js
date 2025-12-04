const axios = require('axios');

module.exports = function (app) {
    app.get('/random/asupan', async (req, res) => {
        const { apikey } = req.query;
        if (!apikey) return res.status(400).json({ status: false, error: 'apikey is required' });
        if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, error: 'invalid apikey' });

        try {
            // Ambil video sebagai stream
            const response = await axios.get('https://api.deline.web.id/random/asupan', {
                responseType: 'stream'
            });

            // Set header video
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
            });

            // Pipe stream langsung ke client
            response.data.pipe(res);

            // Optional: handle error stream
            response.data.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) res.status(500).send('Error streaming video');
            });
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
