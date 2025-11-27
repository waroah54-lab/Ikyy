const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/search/github', async (req, res) => {
        const { apikey, query, sort = 'stars', order = 'desc', per_page = 10 } = req.query;
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
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=${per_page}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('GitHub API error');

            const searchData = await response.json();

            const results = searchData.items.map(repo => ({
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                url: repo.html_url,
                clone_url: repo.clone_url,
                ssh_url: repo.ssh_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                language: repo.language,
                license: repo.license?.name,
                topics: repo.topics,
                created_at: repo.created_at,
                updated_at: repo.updated_at,
                pushed_at: repo.pushed_at,
                owner: {
                    username: repo.owner.login,
                    avatar: repo.owner.avatar_url,
                    profile: repo.owner.html_url
                }
            }));

            res.status(200).json({
                status: true,
                total_count: searchData.total_count,
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

