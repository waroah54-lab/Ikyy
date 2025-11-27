const fs = require('fs');
const path = require('path');
const os = require('os');
const { createCanvas, registerFont } = require('canvas');

const fontgen = {
    list: function () {
        const fontDir = path.join(__dirname, '../library/font');
        if (!fs.existsSync(fontDir)) throw new Error('Font tidak ditemukan!');

        const files = fs.readdirSync(fontDir).filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));
        if (files.length === 0) throw new Error('Tidak ada font di folder font!');

        return files.map(f => path.basename(f, path.extname(f)));
    },

    generate: async function (fontNameInput, userText) {
        const fontDir = path.join(__dirname, '../library/font');
        if (!fs.existsSync(fontDir)) throw new Error('Folder font tidak ditemukan!');

        const files = fs.readdirSync(fontDir).filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

        const foundFontFile = files.find(f =>
            path.basename(f, path.extname(f)).toLowerCase().includes(fontNameInput.toLowerCase())
        );

        if (!foundFontFile) throw new Error(`Font '${fontNameInput}' tidak ditemukan!`);

        const fontPath = path.join(fontDir, foundFontFile);
        const fontFamily = path.basename(foundFontFile, path.extname(foundFontFile));

        try {
            registerFont(fontPath, { family: fontFamily });
            console.log(`✅ Font terdaftar: ${fontFamily} (${fontPath})`);
        } catch (err) {
            console.error(`❌ Gagal register font: ${fontPath}`, err);
        }

        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const maxWidth = canvas.width * 0.8;
        let fontSize = 300;
        do {
            ctx.font = `bold ${fontSize}px "${fontFamily}"`;
            var textMetrics = ctx.measureText(userText);
            if (textMetrics.width <= maxWidth) break;
            fontSize -= 5;
        } while (fontSize > 20);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(userText, canvas.width / 2, canvas.height / 2);

        const buffer = canvas.toBuffer('image/png');
        return buffer;
    }
};

module.exports = function (app) {
    app.get('/canvas/check-font', async (req, res) => {
        const { apikey } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        try {
            const result = fontgen.list();
            res.status(200).json({
                status: true,
                count: result.length,
                fonts: result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });

    app.get('/canvas/text2img', async (req, res) => {
        const { apikey, font, text } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!font) return res.status(400).json({
            status: false,
            error: 'font is required'
        });

        if (!text) return res.status(400).json({
            status: false,
            error: 'text is required'
        });

        try {
            const imageBuffer = await fontgen.generate(font, text);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': imageBuffer.length
            });
            res.end(imageBuffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
