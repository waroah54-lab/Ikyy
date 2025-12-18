const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/bratvid', async (req, res) => {
        const { apikey, text } = req.query;

        // 1. Input Validation
        if (!apikey) return res.status(400).json({ status: false, error: 'apikey is required' });
        if (!global.apikey?.includes(apikey)) return res.status(403).json({ status: false, error: 'invalid apikey' });
        if (!text) return res.status(400).json({ status: false, error: 'text is required' });

        try {
            // 2. Request with Browser-like Headers (GET, not HEAD)
            const response = await axios({
                method: 'GET',
                url: `https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`,
                responseType: 'stream', // Stream for efficiency
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'video/webm,video/*;q=0.9,*/*;q=0.8', // Accept video based on test result
                },
                // Important: Treat 500 as an error to handle
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // Only consider 2xx status codes successful
                }
            });

            // 3. Forward Successful Video Response
            const contentType = response.headers['content-type'] || 'video/webm';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Content-Disposition', 'inline; filename="bratvid.webm"');

            // Pipe the video stream directly to the client
            response.data.pipe(res);

        } catch (error) {
            console.error('Bratvid Proxy Error:', error.message);

            // 4. Specific Error Handling
            if (!res.headersSent) {
                if (error.response) {
                    // The external API returned an error (like 500)
                    res.status(502).json({
                        status: false,
                        error: 'Upstream service error',
                        details: `The video generator service returned an error (Status: ${error.response.status}). Please try again.`
                    });
                } else if (error.code === 'ECONNABORTED') {
                    res.status(504).json({ status: false, error: 'Request to video service timed out' });
                } else {
                    res.status(500).json({ status: false, error: 'Failed to process video request' });
                }
            }
        }
    });
};
