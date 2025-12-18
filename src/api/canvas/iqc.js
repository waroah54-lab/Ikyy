const axios = require('axios');

module.exports = function (app) {
    app.get('/canvas/iphone-quoted', async (req, res) => {
        const { apikey, messageText } = req.query;
        
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!messageText) return res.status(400).json({
            status: false,
            error: 'messageText is required'
        });

        try {
            const { data } = await axios.get(`https://brat.siputzx.my.id/iphone-quoted?messageText=${encodeURIComponent(messageText)}`, {
                responseType: 'arraybuffer'
            });
            
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': data.length,
                'Cache-Control': 'public, max-age=86400'
            });
            
            res.end(data);
        } catch (error) {
            console.error('iPhone Quoted API Error:', error.message);
            res.status(500).json({ 
                status: false, 
                error: 'Failed to generate image',
                details: error.message 
            });
        }
    });
};
