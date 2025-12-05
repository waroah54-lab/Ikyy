// ===============================
// APPLE MUSIC SEARCH (NO CRASH VERSION)
// ===============================

async function appleMusicSearch(query) {
    try {
        const { data } = await axios.get(
            "https://api.baguss.xyz/api/search/applemusic",
            {
                params: { q: query },
                timeout: 10000
            }
        );

        // Cek status API
        if (!data || data.status !== true) {
            throw new Error("API response invalid or failed");
        }

        // Normalize hasil
        let results = [];

        // Kadang API ngirim "results", kadang "result"
        if (Array.isArray(data.results)) {
            results = data.results;
        } else if (Array.isArray(data.result)) {
            results = data.result;
        }

        if (!results.length) {
            throw new Error("No results found");
        }

        return results;

    } catch (err) {
        console.error("AppleMusic Error:", err.message);
        throw new Error("Failed fetching Apple Music data");
    }
}

app.get("/search/applemusic", async (req, res) => {
    const { apikey, query } = req.query;

    if (!apikey)
        return res.status(400).json({ status: false, error: "apikey is required" });

    if (!global.apikey.includes(apikey))
        return res.status(403).json({ status: false, error: "invalid apikey" });

    if (!query)
        return res.status(400).json({ status: false, error: "query is required" });

    try {
        const result = await appleMusicSearch(query);

        res.status(200).json({
            status: true,
            creator: "IkyyOfficial",
            keyword: query,
            total_results: result.length,
            results: result
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message || "Internal server error"
        });
    }
});
