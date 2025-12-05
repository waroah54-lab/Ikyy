const fetch = require("node-fetch");

module.exports = function(app) {

    const project = "ikyy";
    const apiKey = "HOy2rd7nMgsVTiTKFWEckNIGH4BB08b2";

    // CREATE PAYMENT
    app.get("/api/payment", async (req, res) => {
        const amount = req.query.amount;

        if (!amount) return res.json({
            status: false,
            message: "Masukkan nominal"
        });

        try {
            const create = await fetch("https://app.pakasir.com/api/payment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": apiKey
                },
                body: JSON.stringify({
                    project,
                    amount: Number(amount)
                })
            });

            const result = await create.json();

            return res.json({
                status: true,
                data: {
                    code: result.data?.code,
                    qr_image: `https://app.pakasir.com/qris/${result.data?.code}.png`,
                    amount
                }
            });

        } catch (e) {
            res.json({ status: false, error: e.message });
        }
    });

    // PAYMENT STATUS
    app.get("/api/payment/status", async (req, res) => {
        const code = req.query.code;

        if (!code) return res.json({
            status: false,
            message: "Masukkan code"
        });

        try {
            const cek = await fetch(`https://app.pakasir.com/api/payment/status/${code}`, {
                headers: { apikey: apiKey }
            });

            const result = await cek.json();

            res.json({
                status: true,
                paid: result.data?.status === "PAID",
                data: result.data
            });

        } catch {
            res.json({
                status: false,
                paid: false
            });
        }
    });

};
