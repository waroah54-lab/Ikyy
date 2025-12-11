const axios = require("axios");
const cheerio = require("cheerio");

async function googleSearch(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                "Accept-Language": "id-ID,id;q=0.9"
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        // ==== SELECTOR GOOGLE BARU + LAMA (FIX KOMPLIT 2025) ====
        $("div.g, div.tF2Cxc, div.MjjYud").each((i, el) => {
            const title =
                $(el).find("h3").text() ||
                $(el).find(".MBeuO").text(); // title versi layout baru

            const link =
                $(el).find("a").attr("href") ||
                $(el).find("a[jsname='ACyKwe']").attr("href");

            const snippet =
                $(el).find(".VwiC3b").text() ||  // snippet baru
                $(el).find(".lyLwlc").text() ||  // snippet versi 2024+
                $(el).find(".s3v9rd").text();    // snippet lama

            if (title && link) {
                results.push({
                    title,
                    link,
                    snippet: snippet || null
                });
            }
        });

        if (!results.length) {
            return { error: "No results found" };
        }

        return results;

    } catch (err) {
        return { error: err.message };
    }
}

module.exports = function (app) {

    app.get("/search/google", async (req, res) => {
        const { apikey, query } = req.query;

        // VALIDASI APIKEY
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
