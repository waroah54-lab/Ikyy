const axios = require("axios");

module.exports = function (app) {

    async function cekkoutaaxisxl(nomorhp) {
        try {
            // Buat instance request biar stabil (anti 404)
            const api = axios.create({
                baseURL: "https://bendith.my.id",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 12)",
                    "Accept": "*/*",
                    "Referer": "https://bendith.my.id/",
                    "Origin": "https://bendith.my.id"
                },
                timeout: 15000
            });

            const { data } = await api.get("/end.php", {
                params: {
                    check: "package",
                    number: nomorhp,
                    version: "2 201"
                }
            });

            return data;

        } catch (e) {
            throw new Error("CekKuota Error: " + e.message);
        }
    }

    // ============================
    //        EXPRESS ROUTE
    // ============================

    app.get("/tools/cekkouta", async (req, res) => {
        const { apikey, number } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!number)
            return res.status(400).json({ status: false, error: "number is required" });

        try {
            const result = await cekkoutaaxisxl(number);

            res.json({
                status: true,
                number,
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
