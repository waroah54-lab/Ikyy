async function appleMusicSearch(query) {
    try {
        const { data } = await axios.get(
            `https://api.baguss.xyz/api/search/applemusic?q=${encodeURIComponent(query)}`
        );

        if (!data.status) throw new Error("Failed fetching Apple Music data!");

        return data.results;

    } catch (err) {
        throw err;
    }
}

app.get("/search/applemusic", async (req, res) => {
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
            error: error.message
        });
    }
});
