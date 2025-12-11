const axios = require("axios");
const cheerio = require("cheerio");

async function playstoreSearch(query) {
    try {
        const url = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps&hl=id&gl=ID`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Mobile Safari/537.36",
                "Accept-Language": "id-ID,id;q=0.9"
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $("a.VfPpkd-EScbFb-JIbuQc").each((i, el) => {
            const name = $(el).find("div.kcen6d").text().trim();
            const developer = $(el).find("div.b8cIId.KoLSrc").text().trim();
            const rating = $(el).find("div.pf5lIe div").attr("aria-label");
            const icon = $(el).find("img.T75of").attr("src");
            const href = "https://play.google.com" + $(el).attr("href");

            if (!name) return;

            // Extract package ID
            const pkg = new URL(href).searchParams.get("id");

            results.push({
                name,
                developer,
                rating,
                icon,
                link: href,
                package: pkg
            });
        });

        return results.length ? results : { error: "No results found" };

    } catch (e) {
        return { error: e.message };
    }
}

module.exports = function (app) {

    app.get("/search/playstore", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey) return res.status(400).json({ status: false, error: "apikey is required" });
        if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, error: "invalid apikey" });
        if (!query) return res.status(400).json({ status: false, error: "query is required" });

        const result = await playstoreSearch(query);

        res.status(200).json({
            status: true,
            creator: "Ikyy-officiall",
            result
        });
    });

};
