const axios = require("axios");

module.exports = function (app) {

    async function spotifyDl(spotifyUrl) {
        try {
            // Ambil cookies
            const getCookies = await axios.get("https://spotisongdownloader.com/");
            const cookies = (getCookies.headers["set-cookie"] || [])
                .map((c) => c.split(";")[0])
                .join("; ");

            // Instance axios dengan header cookies
            const sp = axios.create({
                baseURL: "https://spotisongdownloader.com",
                headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "cookie": cookies,
                    "referer": "https://spotisongdownloader.to",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            // Ambil metadata track
            const { data: metadata } = await sp.get("/api/composer/spotify/xsingle_track.php", {
                params: { url: spotifyUrl }
            });

            // Request download link
            const { data: download } = await sp.post(
                "/api/composer/spotify/ssdw23456ytrfds.php",
                {
                    url: metadata.url,
                    zip_download: false,
                    quality: "m4a"
                }
            );

            return {
                metadata,
                download: download.dlink
            };

        } catch (e) {
            throw new Error("SpotifyDL Error: " + e.message);
        }
    }

    // EXPRESS ROUTE
    app.get("/download/spotifydl", async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await spotifyDl(url);

            res.json({
                status: true,
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
