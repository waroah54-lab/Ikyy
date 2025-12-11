const axios = require("axios");
const cheerio = require("cheerio");

async function googleSearch(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id&num=20`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Mobile Safari/537.36",
                "Accept-Language": "id-ID,id;q=0.9",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        });

    const $ = cheerio.load(data);
    const results = [];

    // ===========================
    // UNIVERSAL GOOGLE SELECTORS
    // ===========================

    const selectors = [
        "div.g",
        "div.tF2Cxc",
        "div.MjjYud",
        "div.v7W49e",
        "div.NJo7tc",
        "div.dURPMd",
        "div.ULSxyf",
        "div.ZINbbc",
        "div.xuvV6b",
        "div.cu-container"
    ];

    selectors.forEach(sel => {
        $(sel).each((i, el) => {

            const title =
                $(el).find("h3").first().text() ||
                $(el).find("div.BNeawe.vvjwJb.AP7Wnd").first().text() || // mobile
                $(el).find(".MBeuO").first().text() ||
                null;

            const link =
                $(el).find("a").attr("href") ||
                $(el).find("a").first().attr("href") ||
                null;

            const snippet =
                $(el).find(".VwiC3b").first().text() ||
                $(el).find(".lyLwlc").first().text() ||
                $(el).find(".s3v9rd").first().text() ||
                $(el).find(".BNeawe.s3v9rd.AP7Wnd").first().text() || // mobile snippet
                null;

            // Remove redirect URLs ("/url?=")
            let cleanLink = link;
            if (cleanLink && cleanLink.startsWith("/url?")) {
                const urlParams = new URLSearchParams(cleanLink.replace("/url?", ""));
                cleanLink = urlParams.get("q");
            }

            if (title && cleanLink) {
                results.push({
                    title,
                    link: cleanLink,
                    snippet
                });
            }
        });
    });

    if (results.length === 0) {
        return { error: "Google blocked or returned empty layout" };
    }

    return results;

    } catch (e) {
        return { error: e.message };
    }
}

module.exports = function (app) {

    app.get("/search/google", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey) return res.status(400).json({ status: false, error: "apikey is required" });
        if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, error: "invalid apikey" });
        if (!query) return res.status(400).json({ status: false, error: "query is required" });

        const results = await googleSearch(query);

        res.status(200).json({
            status: true,
            creator: "Ikyy-officiall",
            result: results
        });
    });

};
