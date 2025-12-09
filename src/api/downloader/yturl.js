const axios = require("axios");

module.exports = function (app) {

    const baseHeaders = {
        "accept-encoding": "gzip, deflate, br, zstd",
        "user-agent": "Mozilla/5.0"
    };

    const YTMP3_BASE = "https://ytmp3.cx";


    /* EXTRACT VIDEO ID */
    function extractVideoId(url) {
        let v;
        if (url.includes("youtu.be")) {
            v = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
        } else if (url.includes("youtube.com")) {
            if (url.includes("/shorts/")) {
                v = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
            } else {
                v = /v=([a-zA-Z0-9\-_]{11})/.exec(url);
            }
        }
        if (!v?.[1]) throw new Error("Gagal mengambil video ID!");
        return v[1];
    }


    /* GET INIT API URL */
    async function getInitUrl() {
        try {
            const r1 = await axios.get(YTMP3_BASE, { headers: baseHeaders });
            const html = r1.data;

            const jsPath = html.match(/<script src="(.+?)"/)?.[1];
            const jsUrl = YTMP3_BASE + jsPath;

            const r2 = await axios.get(jsUrl, { headers: baseHeaders });
            const js = r2.data;

            const gB_m = js.match(/gB=(.+?),gD/)?.[1];
            const gB = eval(gB_m);

            const html_m = html.match(/<script>(.+?)<\/script>/)?.[1];
            const hiddenGc = eval(html_m + "gC");

            const gC = Object.fromEntries(
                Object.getOwnPropertyNames(hiddenGc).map(k => [k, hiddenGc[k]])
            );

            const api_m = js.match(/t.open\("GET",(.+?),!/)?.[1];
            const apiUrl = eval(api_m);

            return apiUrl;

        } catch (e) {
            throw Error("Gagal mengambil init URL");
        }
    }


    /* DOWNLOAD FUNCTION */
    async function ytmp3Dl(videoUrl, format = "mp3") {
        if (!["mp3", "mp4"].includes(format)) throw Error("Format hanya mp3/mp4");

        const videoId = extractVideoId(videoUrl);

        const headers = {
            referer: YTMP3_BASE,
            ...baseHeaders
        };

        const initApi = await getInitUrl();
        const r1 = await axios.get(initApi, { headers });
        const { convertURL } = r1.data;

        const convertApi = `${convertURL}&v=${videoId}&f=${format}&_=${Math.random()}`;
        const r2 = await axios.get(convertApi, { headers });
        const j2 = r2.data;

        if (j2.error) throw new Error(j2.error);

        // Redirect langsung tersedia
        if (j2.redirectURL) {
            const r3 = await axios.get(j2.redirectURL, { headers });
            const j3 = r3.data;

            return {
                title: j3.title,
                downloadURL: j3.downloadURL,
                format
            };
        }

        // Loop sampai progress 3
        let prog;
        do {
            const r3b = await axios.get(j2.progressURL, { headers });
            prog = r3b.data;

            if (prog.error) throw new Error(prog.error);

            if (prog.progress === 3) {
                return {
                    title: prog.title,
                    downloadURL: j2.downloadURL,
                    format
                };
            }

            await new Promise(res => setTimeout(res, 2000));
        } while (true);
    }


    /* EXPRESS ROUTE: YTMP3 / YTMP4 */
    app.get("/download/ytmp3", async (req, res) => {
        const { url, apikey, format } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey || !global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await ytmp3Dl(url, format || "mp3");

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


    // YTMP4 alias format mp4
    app.get("/download/ytmp4", async (req, res) => {
        const { url, apikey } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey || !global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await ytmp3Dl(url, "mp4");

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
