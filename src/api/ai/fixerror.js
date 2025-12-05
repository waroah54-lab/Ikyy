const axios = require("axios");

module.exports = function (app) {

    // ===============================
    //  AI FIX ERROR API
    // ===============================
    async function fixError(text) {
        try {
            const apiUrl = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(
                text
            )}&prompt=${encodeURIComponent(
                "benerin code dengan benar dan syntax tanpa penjelasan"
            )}`;

            const { data } = await axios.get(apiUrl);

            if (!data || !data.result) throw new Error("Gagal mengambil hasil!");

            return data.result;

        } catch (err) {
            throw err;
        }
    }

    app.get("/ai/fixerror", async (req, res) => {
        const { apikey, text } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: "apikey is required"
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: "invalid apikey"
        });

        if (!text) return res.status(400).json({
            status: false,
            error: "code is required"
        });

        try {
            const result = await fixError(text);

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
