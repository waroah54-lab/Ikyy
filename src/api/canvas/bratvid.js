const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/bratvid', async (req, res) => {
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
            const { data, headers } = await axios.get(`https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`, {
                responseType: 'arraybuffer'
            });
            
            const contentType = headers['content-type'] || 'video/mp4';
            
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Cache-Control': 'public, max-age=86400'
            });
            
            res.end(data);
        } catch (error) {
            console.error('Bratvid API Error:', error.message);
            res.status(500).json({ 
                status: false, 
                error: 'Failed to generate video',
                details: error.message 
            });
        }
    });
};
