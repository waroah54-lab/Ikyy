const axios = require('axios');

module.exports = function (app) {

    async function ppcouple() {
        try {
            const { data } = await axios.get("https://api.deline.web.id/random/ppcouple");

            if (!data.status) throw new Error("Failed to fetch data!");

            const cowoURL = data.result.cowo;
            const ceweURL = data.result.cewe;

            // langsung return URL, tidak fetch gambar
            return {
                cowo: cowoURL,
                cewe: ceweURL
            };

        } catch (err) {
            throw err;
        }
    }

    app.get('/random/ppcouple', async (req, res) => {
        const { apikey } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        try {
            const hasil = await ppcouple();

            res.status(200).json({
                status: true,
                creator: "IkyyOfficial",
                result: {
                    cowo: hasil.cowo,
                    cewe: hasil.cewe
                }
            });

        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });

};
