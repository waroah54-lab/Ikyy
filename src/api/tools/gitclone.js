const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/tools/gitclone', async (req, res) => {
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
            const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
            const match = url.match(githubRegex);

            if (!match) {
                return res.status(400).json({
                    status: false,
                    error: 'Invalid GitHub URL'
                });
            }

            const username = match[1];
            const repoName = match[2].replace(/\.git$/, '');

            const result = {
                username: username,
                repo_name: repoName,
                download_url: `https://github.com/${username}/${repoName}/archive/refs/heads/main.zip`,
                clone_url: `https://github.com/${username}/${repoName}.git`
            };

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
  
