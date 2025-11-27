const axios = require('axios');
const cheerio = require('cheerio');
const { lookup } = require('mime-types');

async function mediafire(url) {
    try {
        if (!url.includes('www.mediafire.com')) throw new Error('Invalid url');

        const { data } = await axios.get(`https://px.nekolabs.my.id/${encodeURIComponent(url)}`);
        const $ = cheerio.load(data.data.content);
        const raw = $('div.dl-info');

        const filename = $('.dl-btn-label').attr('title') || raw.find('div.intro div.filename').text().trim() || null;
        const ext = filename.split('.').pop() || null;
        const mimetype = lookup(ext.toLowerCase()) || null;

        const filesize = raw.find('ul.details li:nth-child(1) span').text().trim();
        const uploaded = raw.find('ul.details li:nth-child(2) span').text().trim();

        const dl = $('a#downloadButton').attr('href');
        if (!dl) throw new Error('File not found');

        return {
            filename,
            filesize,
            mimetype,
            uploaded,
            download_url: dl
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = function (app) {
    app.get('/download/mediafire', async (req, res) => {
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
            let results = await mediafire(query);
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

};
