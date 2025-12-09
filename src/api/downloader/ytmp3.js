const axios = require("axios");

module.exports = function (app) {

    async function ytmp3(url) {
        try {
            const api = `https://api.deline.web.id/downloader/ytmp3?url=${encodeURIComponent(url)}`;

            const { data } = await axios.get(api);

            if (!data.status) {
                throw new Error("Gagal mengambil data dari API");
            }

            return data.result;

        } catch (e) {
            throw new Error("YTMP3 Error: " + e.message);
        }
    }

    // EXPRESS ROUTE
    app.get("/download/ytmp3", async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await ytmp3(url);

            res.json({
                status: true,
                creator: "ikyy-officiall",
                result
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });

};
