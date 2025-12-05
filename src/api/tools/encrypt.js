const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/tools/encrypt', async (req, res) => {
        const { apikey, text } = req.query;

        // cek apikey
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        // cek parameter code text
        if (!text) return res.status(400).json({
            status: false,
            error: 'text is required (code javascript)'
        });

        try {
            // request ke api deline
            const r = await fetch(
                `https://api.deline.web.id/tools/enc?text=${encodeURIComponent(text)}`
            );

            const d = await r.json();

            if (!d.result) {
                return res.status(500).json({
                    status: false,
                    error: 'API respond error'
                });
            }

            // hasil final
            res.status(200).json({
                status: true,
                creator: "ikyy-Officiall",
                result: d.result
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                creator: "ikyy-officiall",
                error: err.message
            });
        }
    });
};
