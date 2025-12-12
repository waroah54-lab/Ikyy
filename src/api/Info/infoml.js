const axios = require('axios');

module.exports = function(app) {
    app.get('/Info/ml', async (req, res) => {
        try {
            // Ambil data asli
            const { data } = await axios.get('https://zelapioffciall.koyeb.app/info/ml');

            // Transform JSON sesuai kebutuhan
            const transformed = data.result.map(item => ({
                eventTitle: item.title,
                link: item.url,
                thumbnail: item.image,
                startDate: item.dateStart,
                endDate: item.dateEnd,
                shortDesc: item.description.length > 100 
                    ? item.description.slice(0, 100) + '...' 
                    : item.description
            }));

            res.json({
                success: true,
                events: transformed
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
};
