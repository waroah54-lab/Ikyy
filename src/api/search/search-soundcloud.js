const axios = require("axios");

module.exports = function (app) {

    async function soundcloudSearch(query) {
        try {
            const { data } = await axios.get(
                `https://api.siputzx.my.id/api/s/soundcloud?query=${encodeURIComponent(query)}`
            );

            if (!data.status) throw new Error("Failed fetching soundcloud data!");

            return data.data;

        } catch (err) {
            throw err;
        }
    }

    app.get("/search/soundcloud", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: "apikey is required"
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: "invalid apikey"
        });

        if (!query) return res.status(400).json({
            status: false,
            error: "query is required"
        });

        try {
            const result = await soundcloudSearch(query);

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
                       
