const axios = require('axios');

module.exports = function(app, botToken, chatId) {

    function sendTelegramError(text) {
        axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text
        }).catch(err => console.error('Gagal kirim notif Telegram:', err.message));
    }

    // 404 Middleware
    app.use((req, res, next) => {
        const message = `⚠️ 404 Not Found\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nTime: ${new Date().toLocaleString()}`;
        sendTelegramError(message);
        res.status(404).json({ status: false, error: 'Endpoint Not Found' });
    });

    // 500 Middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        const message = `⚠️ 500 Internal Server Error\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nError: ${err.message}\nTime: ${new Date().toLocaleString()}`;
        sendTelegramError(message);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    });
};
