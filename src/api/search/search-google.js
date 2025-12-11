const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {

    const googleSearch = async (query) => {
        try {
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;

            const { data } = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "id-ID,id;q=0.9"
                }
            });

            const $ = cheerio.load(data);
            const results = [];

            $("div.g").each((i, el) => {
                const title = $(el).find("h3").text();
                const link = $(el).find("a").attr("href");
                const snippet = $(el).find(".VwiC3b").text();

                if (title && link) {
                    results.push({
                        title,
                        link,
                        snippet: snippet || null
                    });
                }
            });

            return results.length ? results : { error: "No results found" };

        } catch (err) {
            return { error: err.message };
        }
    };

    app.get('/search/google', async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!query) return res.status(400).json({
            status: false,
            error: 'query is required'
        });

        try {
            const results = await googleSearch(query);
            res.status(200).json({
                status: true,
                creator: "Ikyy-officiall",
                result: results
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });

};
