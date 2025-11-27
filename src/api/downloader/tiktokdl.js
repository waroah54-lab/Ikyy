const cheerio = require("cheerio");
const axios = require("axios");

const headers = {
    "authority": "ttsave.app",
    "accept": "application/json, text/plain, */*",
    "origin": "https://ttsave.app",
    "referer": "https://ttsave.app/en",
    "user-agent": "Postify/1.0.0",
};

const tiktokdl = {
    submit: async function (url, referer) {
        const headerx = { ...headers, referer };
        const data = { query: url, language_id: "1" };
        return axios.post('https://ttsave.app/download', data, { headers: headerx });
    },

    parse: function ($) {
        const dlink = {
            nowm: $('a.w-full.text-white.font-bold').first().attr('href'),
            audio: $('a[type="audio"]').attr('href'),
        };

        const slides = $('a[type="slide"]').map((i, el) => ({
            images: i + 1,
            img_result: $(el).attr('href')
        })).get();

        return { dlink, slides };
    },

    fetchData: async function (link) {
        try {
            const response = await this.submit(link, 'https://ttsave.app/en');
            const $ = cheerio.load(response.data);
            const result = this.parse($);

            const isSlidePost = result.slides && result.slides.length > 0;

            if (isSlidePost) {
                return {
                    audio: result.dlink.audio,
                    slides: result.slides
                };
            }

            return {
                video: result.dlink.nowm,
                audio: result.dlink.audio,
                slides: result.slides
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = function (app) {
    app.get('/download/tiktok', async (req, res) => {
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
            const result = await tiktokdl.fetchData(query);
            res.status(200).json({
                status: true,
                result: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};

