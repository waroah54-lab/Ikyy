```javascript
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
            const response = await axios.get(`https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*'
                }
            });
            
            const contentType = response.headers['content-type'] || 'video/webm';
            
            res.set({
                'Content-Type': contentType,
                'Content-Length': response.data.length,
                'Cache-Control': 'public, max-age=86400'
            });
            
            res.send(Buffer.from(response.data));
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
```
