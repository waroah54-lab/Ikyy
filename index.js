const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.SERVER_PORT;

const GITHUB_TOKEN = '';
const GITHUB_OWNER = 'waroah54-lab';
const GITHUB_REPO = 'Ikyy';
const REQUEST_FILE = 'filex.json';
/*const telegramLogger = require('./telegramLogger');
const TELEGRAM_BOT_TOKEN = '8594290972:AAEHwe3w4bsBxOyct1B_FXRxNDNBy-Y2yGI';
const TELEGRAM_CHAT_ID = '-1002966989270';

telegramLogger(app, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);*/

app.set("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;

const prefixes = new Set();
settings.categories.forEach(category => {
    category.items.forEach(item => {
        const base = '/' + item.path.split('/')[1];
        prefixes.add(base);
    });
});

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
        return {
            totalRequests: 0,
            todayRequests: 0
        };
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

app.get('/sharecode', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'sharecode.html'));
});

app.get('/tools-encrypt', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'tools-encrypt.html'));
});
app.get('/sendtele', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'sendtele.html'));
});

app.get('/api/tools/encrypt', async (req, res) => {
    const text = req.query.text;
    
    if (!text) return res.json({
        status: false,
        message: "Masukkan ?text=code"
    });

    try {
        const r = await fetch(`https://api.deline.web.id/tools/enc?text=${encodeURIComponent(text)}`);
        const d = await r.json();

        res.json({
            status: true,
            result: d.result
        });

    } catch (e) {
        res.json({
            status: false,
            error: e.message
        });
    }
});

app.get('/portofolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'portofolio.html'));
});

app.get('/codeshare/list', (req, res) => {
    const dir = path.join(__dirname, "src", "sharecode");
    if (!fs.existsSync(dir)) return res.json([]);

    const files = fs.readdirSync(dir).map(f => ({
        filename: f,
        url: `/codeshare/raw/${f}`
    }));

    res.json(files);
});

app.get('/codeshare/raw/:file', (req, res) => {
    const dir = path.join(__dirname, "src", "sharecode", req.params.file);

    if (!fs.existsSync(dir)) return res.status(404).send('File not found');

    res.setHeader("Content-Type", "text/plain");
    res.send(fs.readFileSync(dir, 'utf8'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'payment.html'));
});


app.get('/codeshare', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'codeshare.html'));
});

app.post('/sharecode-upload', (req, res) => {
    const { filename, code } = req.body;

    if (!filename || !code) {
        return res.status(400).json({ status: false, message: "Isi tidak lengkap" });
    }

    const savePath = path.join(__dirname, "src", "sharecode");

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });

    fs.writeFileSync(path.join(savePath, filename), code);

    res.json({ status: true, file: filename });
});

app.use(async (req, res, next) => {
    const skipPaths = ['/favicon.ico', '/global-stats', '/'];
    const skipPrefixes = ['/src'];

    if (req.method === 'OPTIONS') {
        return next();
    }

    if (skipPaths.includes(req.path)) {
        return next();
    }

    if (skipPrefixes.some(prefix => req.path.startsWith(prefix))) {
        return next();
    }

    const isAPIRequest = [...prefixes].some(prefix => req.path.startsWith(prefix));
    if (!isAPIRequest) {
        return next();
    }

    try {
        await addRequest(req.path);
    } catch (error) {
        console.error('Error tracking:', error);
    }

    next();
});

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Savant UI",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
