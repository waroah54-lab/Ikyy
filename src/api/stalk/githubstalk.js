const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/stalk/github', async (req, res) => {
        const { apikey, user } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!user) return res.status(400).json({
            status: false,
            error: 'username is required'
        });

        try {
            const response = await fetch(`https://api.github.com/users/${user}`);
            if (!response.ok) throw new Error('User not found');

            const userData = await response.json();

            const result = {
                username: userData.login,
                name: userData.name,
                bio: userData.bio,
                company: userData.company,
                location: userData.location,
                email: userData.email,
                blog: userData.blog,
                twitter: userData.twitter_username,
                public_repos: userData.public_repos,
                public_gists: userData.public_gists,
                followers: userData.followers,
                following: userData.following,
                created_at: userData.created_at,
                updated_at: userData.updated_at,
                avatar: userData.avatar_url,
                profile_url: userData.html_url
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

