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
            const response = await fetch(`https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            // Get content type from response
            const contentType = response.headers.get('content-type') || 'video/mp4';
            const contentLength = response.headers.get('content-length');
            
            // Set headers
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': contentLength,
                'Cache-Control': 'public, max-age=86400',
                'Accept-Ranges': 'bytes',
                'Content-Disposition': 'inline; filename="bratvid.mp4"'
            });
            
            // Stream the response body
            const reader = response.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            
            res.end();
            
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
