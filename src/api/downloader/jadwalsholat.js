const axios = require("axios");

module.exports = function (app) {

    async function jadwalSholat(kota) {
        try {
            const { data } = await axios.get(
                `https://api.deline.web.id/info/jadwalsholat?kota=${encodeURIComponent(kota)}`
            );

            if (!data.status) throw new Error(data.error || "Failed fetching jadwal sholat!");

            return data.result;

        } catch (err) {
            throw err;
        }
    }

    // Route fixed ✔
    app.get("/download/jadwalsholat", async (req, res) => {
        const { apikey, kota } = req.query;

        // Cek apikey
        if (!apikey) return res.status(400).json({
            status: false,
            error: "apikey is required"
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: "invalid apikey"
        });

        // Cek kota
        if (!kota) return res.status(400).json({
            status: false,
            error: "kota is required"
        });

        try {
            const result = await jadwalSholat(kota);

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
