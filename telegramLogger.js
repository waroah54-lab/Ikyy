const axios = require('axios');

module.exports = function(app, botToken, chatId) {

    // Helper kirim notif ke Telegram
    async function sendTelegramError(text) {
        try {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text
            });
        } catch (err) {
            console.error('Gagal kirim notif Telegram:', err.message);
        }
    }

    // Middleware untuk 404
    app.use((req, res, next) => {
        const message = `⚠️ 404 Not Found\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nTime: ${new Date().toLocaleString()}`;
        sendTelegramError(message);
        res.status(404).sendFile(process.cwd() + "/api-page/404.html");
    });

    // Middleware untuk error handler 500
    app.use((err, req, res, next) => {
        console.error(err.stack);
        const message = `⚠️ 500 Internal Server Error\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nError: ${err.message}\nTime: ${new Date().toLocaleString()}`;
        sendTelegramError(message);
        res.status(500).sendFile(process.cwd() + "/api-page/500.html");
    });

    // Optional: middleware untuk 400 (bad request)
    app.use((req, res, next) => {
        if (res.statusCode === 400) {
            const message = `⚠️ 400 Bad Request\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nTime: ${new Date().toLocaleString()}`;
            sendTelegramError(message);
        }
        next();
    });

};
