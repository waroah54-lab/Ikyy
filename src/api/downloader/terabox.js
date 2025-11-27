const axios = require("axios");

module.exports = function (app) {

    async function teraboxClean(url) {
        try {
            const { data } = await axios.get(`https://api.deline.web.id/downloader/terabox?url=${encodeURIComponent(url)}`);

            if (!data.status) throw new Error("Failed fetching terabox data!");

            const files = data.result.Files || [];

            // Mapping bersih: name, thumbnail, download
            const clean = files.map(f => ({
                name: f.Name,
                thumb: f.Thumbnails?.x || null,
                download: f.Direct_Download_Link
            }));

            return clean;

        } catch (err) {
            throw err;
        }
    }

    app.get("/download/terabox", async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: "apikey is required"
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: "invalid apikey"
        });

        if (!url) return res.status(400).json({
            status: false,
            error: "url is required"
        });

        try {
            const result = await teraboxClean(url);

            res.status(200).json({
                status: true,
                creator: "IkyyOfficial",
                result
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });

};
