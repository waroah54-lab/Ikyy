module.exports = function (app) {

function listRoutes() {
    if (!app._router || !app._router.stack) return 0;

    let anuan = app._router.stack
        .filter(layer => layer.route)
        .map(layer => ({
            method: Object.keys(layer.route.methods).join(', ').toUpperCase(),
            path: layer.route.path
        }));

    // jika ingin exclude path ini
    return anuan.filter(r => r.path !== "/api/status").length;
}

app.get('/api/status', async (req, res) => {
    try {
        res.status(200).json({
            status: true,
            result: {
                status: "Aktif",
                totalrequest: global.totalreq.toString(),
                totalfitur: listRoutes(),
                runtime: runtime(process.uptime()),
                domain: req.hostname
            }
        });
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});
}
