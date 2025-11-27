const axios = require("axios");

module.exports = function (app) {

    async function cuaca(query) {
        try {
            if (!query) throw new Error("Query is required");

            const { data } = await axios.get(
                `https://wttr.in/${encodeURIComponent(query)}?format=j1`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
                    }
                }
            );

            const lokasi = data.nearest_area?.[0]?.areaName?.[0]?.value || query;
            const kondisi = data.current_condition?.[0];

            return {
                lokasi,
                waktu: kondisi.localObsDateTime || "-",
                kondisi: kondisi.weatherDesc?.[0]?.value || "-",
                suhu: kondisi.temp_C + "°C",
                kelembapan: kondisi.humidity + "%",
                angin: kondisi.windspeedKmph + " km/h"
            };

        } catch (err) {
            throw new Error(err.message);
        }
    }

    // ============================
    //     ROUTE: CUACA
    // ============================
    app.get("/Info/cuaca", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!query)
            return res.status(400).json({ status: false, error: "query is required" });

        try {
            const result = await cuaca(query);

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
