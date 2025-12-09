const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {

    // =========================
    //  SCRAPER TOKEN + ID
    // =========================
    async function getTop4TopToken() {
        const html = await axios.get("https://top4top.me/en/");
        const data = html.data;

        const token = data.match(/name="token" value="(.*?)"/)?.[1];
        const id = data.match(/name="id" value="(.*?)"/)?.[1];

        if (!token || !id) throw new Error("Gagal mengambil token top4top");

        return { token, id };
    }

    // =========================
    //  UPLOAD PROCESS
    // =========================
    async function uploadTop4Top(fileUrl) {
        const { token, id } = await getTop4TopToken();

        // Download file dulu
        const file = await axios.get(fileUrl, {
            responseType: "arraybuffer"
        });

        const filename = "upload_" + Date.now();

        const form = new FormData();
        form.append("token", token);
        form.append("id", id);
        form.append("method", "upload");
        form.append("file", file.data, filename);

        const upload = await axios.post("https://top4top.me/upload", form, {
            headers: form.getHeaders()
        });

        if (!upload.data?.url) {
            throw new Error("Upload gagal: " + JSON.stringify(upload.data));
        }

        return upload.data.url;
    }

    // =========================
    //  ROUTER /upload/top4top
    // =========================
    app.get("/upload/top4top", async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await uploadTop4Top(url);

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
