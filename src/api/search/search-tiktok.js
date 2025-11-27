const axios = require("axios")
const FormData = require("form-data")

const ttSearch = async (query) => {
    try {
        let d = new FormData();
        d.append("keywords", query);
        d.append("count", 15);
        d.append("cursor", 0);
        d.append("web", 1);
        d.append("hd", 1);

        let h = {
            headers: {
                ...d.getHeaders()
            }
        }

        let { data } = await axios.post("https://tikwm.com/api/feed/search", d, h);

        const baseURL = "https://tikwm.com";

        const videos = data.data.videos.map(video => {
            return {
                ...video,
                play: baseURL + video.play,
                wmplay: baseURL + video.wmplay,
                music: baseURL + video.music,
                cover: baseURL + video.cover,
                avatar: baseURL + video.avatar
            };
        });

        return videos;
    } catch (e) {
        return e
    }
}

module.exports = function (app) {
    app.get('/search/tiktok', async (req, res) => {
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
        })

        try {
            const results = await ttSearch(query);
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });

}
