const axios = require("axios");

module.exports = function (app) {

    async function cekkoutaaxisxl(number) {
        try {
            const { data } = await axios.get("https://bendith.my.id/end.php", {
                params: {
                    check: "package",
                    number,
                    version: "2 201"
                }
            });
            return data;

        } catch (e) {
            throw new Error("Cek Kuota Error: " + e.message);
        }
    }

    // EXPRESS ROUTE
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
