const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

module.exports = function (app) {
    app.get('/tools/ascii', async (req, res) => {
        const { apikey, url } = req.query;

        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!url) return res.status(400).json({
            status: false,
            error: 'url is required'
        });

        try {
            // download image
            const img = await axios.get(url, {
                responseType: "arraybuffer",
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            // form-data builder
            const form = new FormData();
            form.append("format", "ascii");
            form.append("width", "100");
            form.append("textcolor", "#000000");
            form.append("bgcolor", "#ffffff");
            form.append("invert", "0");
            form.append("contrast", "1");

            form.append("image", Buffer.from(img.data), {
                filename: "image.jpg",
                contentType: "image/jpeg"
            });

            // upload to converter
            const response = await axios.post(
                "https://www.text-image.com/convert/result.cgi",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        "User-Agent": "Mozilla/5.0",
                        "Origin": "https://www.text-image.com",
                        "Referer": "https://www.text-image.com/convert/ascii.html"
                    }
                }
            );

            const $ = cheerio.load(response.data);

            const ascii = $("#tiresult").text().trim();
            const shareLink = $("#sharebutton").parent().find("a").attr("href") || null;

            if (!ascii) {
                return res.status(500).json({
                    status: false,
                    error: "Conversion failed (no ASCII output)"
                });
            }

            res.status(200).json({
                status: true,
                result: {
                    ascii: ascii,
                    share: shareLink
                }
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};
