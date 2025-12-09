const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");

module.exports = function (app) {

    // === multer untuk nerima file dari user ===
    const upload = multer({ storage: multer.memoryStorage() });

    async function getTop4TopToken() {
        const html = await axios.get("https://top4top.me/en/");
        const data = html.data;

        const token = data.match(/name="token" value="(.*?)"/)?.[1];
        const id = data.match(/name="id" value="(.*?)"/)?.[1];

        if (!token || !id) throw new Error("Gagal ambil token top4top");

        return { token, id };
    }

    async function uploadTop4Top(buffer, originalName) {
        const { token, id } = await getTop4TopToken();

        const form = new FormData();
        form.append("token", token);
        form.append("id", id);
        form.append("method", "upload");
        form.append("file", buffer, originalName);

        const upload = await axios.post("https://top4top.me/upload", form, {
            headers: form.getHeaders()
        });

        if (!upload.data?.url) {
            throw new Error("Upload gagal: " + JSON.stringify(upload.data));
        }

        return upload.data.url;
    }

    // ============================
    // ROUTE: POST /upload/top4top
    // ============================
    app.post("/upload/top4top", upload.single("file"), async (req, res) => {
        const { apikey } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!req.file)
            return res.status(400).json({ status: false, error: "file is required" });

        try {
            const result = await uploadTop4Top(req.file.buffer, req.file.originalname);

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
