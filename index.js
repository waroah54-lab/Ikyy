const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const axios = require('axios');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// === Telegram Config ===
const TELEGRAM_BOT_TOKEN = '8594290972:AAEHwe3w4bsBxOyct1B_FXRxNDNBy-Y2yGI';
const TELEGRAM_CHAT_ID = '-1002966989270';

async function sendTelegramError(text) {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text
        });
    } catch (err) {
        console.error('Gagal kirim notif Telegram:', err.message);
    }
}

// === Express Setup ===
app.set("trust proxy", true);
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static files
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/', express.static(path.join(__dirname, 'api-page')));

// Load settings & global apikey
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey || [];

const prefixes = new Set();
settings.categories.forEach(category => {
    category.items.forEach(item => {
        const base = '/' + item.path.split('/')[1];
        prefixes.add(base);
    });
});

// === GitHub Helper Functions ===
const GITHUB_TOKEN = '';
const GITHUB_OWNER = 'waroah54-lab';
const GITHUB_REPO = 'Ikyy';
const REQUEST_FILE = 'filex.json';

async function getGitHubFile(filePath) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Ikyy-RestApi'
            }
        });

        if (response.status === 404) {
            return { content: Buffer.from('[]').toString('base64'), sha: null };
        }

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting GitHub file:', error);
        return { content: Buffer.from('[]').toString('base64'), sha: null };
    }
}

async function updateGitHubFile(filePath, data) {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            const existingFile = await getGitHubFile(filePath);
            const currentContent = JSON.parse(Buffer.from(existingFile.content, 'base64').toString());

            const newContent = Array.isArray(data) ? data : [...currentContent, data];

            const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'User-Agent': 'Savant-API',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update ${filePath}`,
                    content: Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64'),
                    sha: existingFile.sha
                })
            });

            if (response.status === 409) {
                retryCount++;
                console.log(chalk.yellow(`Retry ${retryCount}/${maxRetries} for ${filePath} due to conflict`));
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            if (!response.ok) {
                throw new Error(`GitHub update error: ${response.status}`);
            }

            return true;
        } catch (error) {
            if (error.message.includes('409') && retryCount < maxRetries) {
                retryCount++;
                console.log(chalk.yellow(`Retry ${retryCount}/${maxRetries} for ${filePath} due to conflict`));
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            throw error;
        }
    }

    throw new Error(`Failed to update ${filePath} after ${maxRetries} retries`);
}

async function addRequest(endpoint) {
    try {
        const requestData = await getGitHubFile(REQUEST_FILE);
        const requests = JSON.parse(Buffer.from(requestData.content, 'base64').toString());

        const newRequest = {
            endpoint: endpoint,
            timestamp: new Date().toLocaleString('id-ID'),
            date: new Date().toLocaleDateString('id-ID')
        };

        requests.push(newRequest);
        await updateGitHubFile(REQUEST_FILE, requests);

        console.log(chalk.bgHex('#0000FF').hex('#ffffffff').bold(' REQUEST ') + ' ' +
            chalk.hex('#00FFFF')(`${endpoint}`) +
            chalk.hex('#FF00FF')(' \n❯❯ ') +
            chalk.hex('#FFFF00')(`${new Date().toLocaleString('id-ID')}`));

        return requests.length;
    } catch (error) {
        console.error('Error adding request:', error);
        return 0;
    }
}

// === Stats ===
async function getStats() {
    try {
        const requestData = await getGitHubFile(REQUEST_FILE);
        const requests = JSON.parse(Buffer.from(requestData.content, 'base64').toString());

        const today = new Date().toLocaleDateString('id-ID');
        const todayRequests = requests.filter(req => req.date === today).length;

        return {
            totalRequests: requests.length,
            todayRequests: todayRequests
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { totalRequests: 0, todayRequests: 0 };
    }
}

app.get('/global-stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// === Example Routes ===
// /api/tools/encrypt
app.get('/api/tools/encrypt', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        sendTelegramError(`⚠️ 400 Bad Request\nEndpoint: /api/tools/encrypt\nReason: text parameter kosong\nIP: ${req.ip}`);
        return res.status(400).json({ status: false, message: "Masukkan ?text=code" });
    }

    try {
        const r = await fetch(`https://api.deline.web.id/tools/enc?text=${encodeURIComponent(text)}`);
        const d = await r.json();
        res.json({ status: true, result: d.result });
    } catch (e) {
        sendTelegramError(`⚠️ 500 Internal Server Error\nEndpoint: /api/tools/encrypt\nError: ${e.message}\nIP: ${req.ip}`);
        res.status(500).json({ status: false, error: e.message });
    }
});

// Add your other routes here following same pattern

// === Request Tracking Middleware ===
app.use(async (req, res, next) => {
    const skipPaths = ['/favicon.ico', '/global-stats', '/'];
    const skipPrefixes = ['/src'];

    if (req.method === 'OPTIONS') return next();
    if (skipPaths.includes(req.path)) return next();
    if (skipPrefixes.some(prefix => req.path.startsWith(prefix))) return next();

    const isAPIRequest = [...prefixes].some(prefix => req.path.startsWith(prefix));
    if (!isAPIRequest) return next();

    try {
        await addRequest(req.path);
    } catch (error) {
        console.error('Error tracking:', error);
    }

    next();
});

// === JSON Response Middleware ===
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status !== undefined ? data.status : true,
                creator: settings.apiSettings.creator || "Created Using Savant UI",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// === Load API routes dynamically ===
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

// Root route
app.get('/', (req, res) => {
    res.json({ status: true, message: 'API is running', creator: settings.apiSettings.creator || "Created Using Savant UI" });
});

// === Error Handlers ===

// 404 Not Found
app.use((req, res, next) => {
    const message = `⚠️ 404 Not Found\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nTime: ${new Date().toLocaleString()}`;
    sendTelegramError(message);
    res.status(404).json({ status: false, error: 'Endpoint Not Found' });
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    const message = `⚠️ 500 Internal Server Error\nMethod: ${req.method}\nEndpoint: ${req.originalUrl}\nIP: ${req.ip}\nError: ${err.message}\nTime: ${new Date().toLocaleString()}`;
    sendTelegramError(message);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
});

// Start server (untuk local testing)
app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
