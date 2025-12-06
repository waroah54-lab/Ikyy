const axios = require('axios')

module.exports = function (app) {
    const sc = {
        helper: {
            prettyError(string) {
                const MAX_LENGTH = 200;
                const type = typeof string;
                if (type !== "string") return `(invalid type: ${type})`;
                if (!string) return '(empty message)';
                let msg = string;
                try { msg = JSON.stringify(JSON.parse(string), null, 2) } catch (_) {}
                if (msg.length > MAX_LENGTH) msg = msg.substring(0, MAX_LENGTH) + `...`;
                return msg;
            }
        },

        static: {
            baseHeaders: {
                'accept-encoding': 'gzip, deflate, br, zstd',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
            }
        },

        async getTrackMetadata(mobileUrl) {
            const r = await axios.get(mobileUrl, { headers: this.static.baseHeaders }).catch(err => err.response);
            if (!r || r.status !== 200) throw new Error(`getTrackMetadata ${r?.status} ${this.helper.prettyError(r?.data)}`);

            const html = r.data;
            const match = html.match(/__NEXT_DATA__" type="application\/json">(.+?)<\/script\>\</)?.[1];
            if (!match) throw new Error('gagal mendapatkan metadata track');

            return JSON.parse(match);
        },

        toMobileUrl(trackUrl) {
            const url = new URL(trackUrl);
            if (!url.host.startsWith("m.")) url.host = "m." + url.host;
            return url.toString();
        },

        async getProgressiveUrl(tmObj) {
            const store = tmObj.props.pageProps.initialStoreState.entities.tracks;
            const ctm = Object.entries(store)[0][1].data;

            const purl = ctm.media.transcodings.find(x => x.format.protocol === "progressive")?.url;
            if (!purl) throw new Error("tidak menemukan progressive url");

            const url = new URL(purl);
            url.search = new URLSearchParams({
                client_id: tmObj.runtimeConfig.clientId,
                track_authorization: ctm.track_authorization,
                stage: ""
            });

            const r = await axios.get(url.toString(), { headers: this.static.baseHeaders }).catch(err => err.response);
            if (!r || r.status !== 200) throw new Error(`getProgressiveUrl ${r?.status}`);

            return { title: ctm.title, audioUrl: r.data.url };
        },

        async downloadTrack(trackUrl) {
            const mobile = this.toMobileUrl(trackUrl);
            const metadata = await this.getTrackMetadata(mobile);
            return await this.getProgressiveUrl(metadata);
        }
    };

    // ROUTE EXPRESS
    app.get('/download/soundclouddl', async (req, res) => {
        const { apikey, url } = req.query;

        // cek apikey
        if (!apikey) return res.status(400).json({ status: false, error: "apikey is required" });
        if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, error: "invalid apikey" });

        // cek url
        if (!url) return res.status(400).json({ status: false, error: "url is required" });

        try {
            const { title, audioUrl } = await sc.downloadTrack(url);

            res.json({
                status: true,
                title,
                audio_url: audioUrl
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
