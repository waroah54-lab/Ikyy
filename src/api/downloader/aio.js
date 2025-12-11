const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {

    async function aioRetatube(url) {
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'authority': 'retatube.com',
                'accept': '*/*',
                'accept-language': 'id-ID,id;q=0.9',
                'hx-current-url': 'https://retatube.com/',
                'hx-request': 'true',
                'hx-target': 'aio-parse-result',
                'hx-trigger': 'search-btn',
                'origin': 'https://retatube.com',
                'referer': 'https://retatube.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
            };

            // FIX: HANYA gunakan retatube.com (bukan us.retatube.com)
            const page = await axios.get("https://retatube.com/api/v1/aio/index?s=retatube.com", {
                headers
            });

            const $ = cheerio.load(page.data);
            const prefix = $('input[name="prefix"]').val();

            if (!prefix) throw new Error("Gagal mengambil token prefix");

            const token = prefix.trim();

            const response = await axios.post(
                "https://retatube.com/api/v1/aio/search",
                `prefix=${encodeURIComponent(token)}&vid=${encodeURIComponent(url)}`,
                { headers }
            );

            const $$ = cheerio.load(response.data);

            const title = $$('#text-786685718 p').eq(0).text().replace('Title：', '').trim();
            const owner = $$('#text-786685718 p').eq(1).text().replace('Owner：', '').trim();
            const thumbnail = $$('.icon-inner img').attr('src');
            const hdUrl = $$('#col-1098044499 a').eq(0).attr('href');
            const sdUrl = $$('#col-1098044499 a').eq(1).attr('href');
            const wmUrl = $$('#col-1098044499 a').eq(2).attr('href');
            const audioUrl = $$('#col-1098044499 a.custom_green_color').attr('href');

            let results = {};

            if (/youtu/.test(url)) {
                results = { title, thumb: thumbnail };

            } else if (/instagram/.test(url)) {
                results = { title, owner, thumb: thumbnail, video: hdUrl };

            } else if (/tiktok|douyin/.test(url)) {
                results = { title, owner, thumb: thumbnail, video: hdUrl, audio: audioUrl };

            } else if (/facebook|fb.watch/.test(url)) {
                results = { title, thumb: thumbnail, video: { hd: hdUrl, sd: sdUrl } };

            } else if (/twitter|x.com/.test(url)) {
                results = { title, owner, thumb: thumbnail, video: hdUrl };

            } else if (/pinterest|pin\.it/.test(url)) {
                results = { image: audioUrl };

            } else if (/capcut/.test(url)) {
                results = { title, thumb: thumbnail, video: { hd: hdUrl, sd: sdUrl, wm: wmUrl } };

            } else if (/spotify/.test(url)) {
                results = { title, thumb: thumbnail, audio: audioUrl };

            } else if (/soundcloud/.test(url)) {
                results = { title, thumb: thumbnail, audio: audioUrl };
            }

            return results;

        } catch (err) {
            return "Error: " + (err.message || err);
        }
    }

    // ROUTE API
    app.get('/download/aio', async (req, res) => {
        const { url } = req.query;

        if (!url)
            return res.json({
                status: false,
                creator: "Ikyy",
                result: "Parameter url required!"
            });

        const result = await aioRetatube(url);

        res.json({
            status: true,
            creator: "Ikyy-Officiall",
            result
        });
    });

};
