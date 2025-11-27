const axios = require("axios");

module.exports = function (app) {

    // ============================
    //  STICKERLY SEARCH
    // ============================
    async function stickerlySearch(query) {
        try {
            if (!query) throw new Error("Query is required");

            const { data } = await axios.post(
                "https://api.sticker.ly/v4/stickerPack/smartSearch",
                {
                    keyword: query,
                    enabledKeywordSearch: true,
                    filter: {
                        extendSearchResult: false,
                        sortBy: "RECOMMENDED",
                        languages: ["ALL"],
                        minStickerCount: 5,
                        searchBy: "ALL",
                        stickerType: "ALL"
                    }
                },
                {
                    headers: {
                        "user-agent":
                            "androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)",
                        "content-type": "application/json",
                        "accept-encoding": "gzip"
                    }
                }
            );

            const packs = data.result.stickerPacks || [];

            return packs.map(pack => ({
                name: pack.name,
                author: pack.authorName,
                stickerCount: pack.resourceFiles.length,
                viewCount: pack.viewCount,
                exportCount: pack.exportCount,
                isPaid: pack.isPaid,
                isAnimated: pack.isAnimated,
                thumbnailUrl: `${pack.resourceUrlPrefix}${pack.resourceFiles[pack.trayIndex]}`,
                url: pack.shareUrl
            }));

        } catch (error) {
            throw new Error(error.message);
        }
    }

    // ============================
    //  STICKERLY DETAIL
    // ============================
    async function stickerlyDetail(url) {
        try {
            const match = url.match(/\/s\/([^\/\?#]+)/);
            if (!match) throw new Error("Invalid url");

            const { data } = await axios.get(
                `https://api.sticker.ly/v4/stickerPack/${match[1]}?needRelation=true`,
                {
                    headers: {
                        "user-agent":
                            "androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)",
                        "content-type": "application/json",
                        "accept-encoding": "gzip"
                    }
                }
            );

            return {
                name: data.result.name,
                author: {
                    name: data.result.user.displayName,
                    username: data.result.user.userName,
                    bio: data.result.user.bio,
                    followers: data.result.user.followerCount,
                    following: data.result.user.followingCount,
                    isPrivate: data.result.user.isPrivate,
                    avatar: data.result.user.profileUrl,
                    website: data.result.user.website,
                    url: data.result.user.shareUrl
                },
                stickers: data.result.stickers.map(stick => ({
                    fileName: stick.fileName,
                    isAnimated: stick.isAnimated,
                    imageUrl: `${data.result.resourceUrlPrefix}${stick.fileName}`
                })),
                stickerCount: data.result.stickers.length,
                viewCount: data.result.viewCount,
                exportCount: data.result.exportCount,
                isPaid: data.result.isPaid,
                isAnimated: data.result.isAnimated,
                thumbnailUrl: `${data.result.resourceUrlPrefix}${data.result.stickers[data.result.trayIndex].fileName}`,
                url: data.result.shareUrl
            };

        } catch (error) {
            throw new Error(error.message);
        }
    }

    // ============================
    //     ROUTE: SEARCH
    // ============================
    app.get("/search/sticker", async (req, res) => {
        const { apikey, query } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!query)
            return res.status(400).json({ status: false, error: "query is required" });

        try {
            const result = await stickerlySearch(query);

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

    // ============================
    //     ROUTE: DETAIL
    // ============================
    app.get("/tools/sticker", async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey)
            return res.status(400).json({ status: false, error: "apikey is required" });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({ status: false, error: "invalid apikey" });

        if (!url)
            return res.status(400).json({ status: false, error: "url is required" });

        try {
            const result = await stickerlyDetail(url);

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
      
