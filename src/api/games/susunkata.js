const axios = require("axios");

module.exports = function (app) {

    // ================================
    //  BANK SOAL SUSUN KATA
    // ================================
    const susunKata = [

        // === Hewan
        { tipe: "hewan", soal: "kucan", jawaban: "kucing" },
        { tipe: "hewan", soal: "natuk", jawaban: "kunta" },
        { tipe: "hewan", soal: "rakbu", jawaban: "burak" },
        { tipe: "hewan", soal: "tapin", jawaban: "pantai" },
        { tipe: "hewan", soal: "nujar", jawaban: "anjur" },

        // === Buah
        { tipe: "buah", soal: "anagil", jawaban: "naga" },
        { tipe: "buah", soal: "pakiin", jawaban: "pepaya" },
        { tipe: "buah", soal: "kmaang", jawaban: "mangga" },
        { tipe: "buah", soal: "rukdee", jawaban: "durkee" },
        { tipe: "buah", soal: "arapet", jawaban: "pareta" },

        // === Makanan
        { tipe: "makanan", soal: "kgorean", jawaban: "rongake" },
        { tipe: "makanan", soal: "iralmi", jawaban: "miaril" },
        { tipe: "makanan", soal: "tkabo", jawaban: "batok" },
        { tipe: "makanan", soal: "saaty", jawaban: "satay" },
        { tipe: "makanan", soal: "kedagni", jawaban: "kadinge" },

        // === Barang
        { tipe: "barang", soal: "umhetl", jawaban: "helm" },
        { tipe: "barang", soal: "ratsme", jawaban: "master" },
        { tipe: "barang", soal: "kaemsra", jawaban: "kamera" },
        { tipe: "barang", soal: "nkupol", jawaban: "lupkon" },
        { tipe: "barang", soal: "alept", jawaban: "telpa" },

        // === Tempat
        { tipe: "tempat", soal: "patsu", jawaban: "pasta" },
        { tipe: "tempat", soal: "arajkp", jawaban: "jakrap" },
        { tipe: "tempat", soal: "usanrl", jawaban: "sulran" },
        { tipe: "tempat", soal: "otpkas", jawaban: "takpos" },
        { tipe: "tempat", soal: "semal", jawaban: "mesal" },

        // === Random tambahan
        { tipe: "random", soal: "rteak", jawaban: "taker" },
        { tipe: "random", soal: "lapen", jawaban: "panel" },
        { tipe: "random", soal: "tamro", jawaban: "roma" },
        { tipe: "random", soal: "klima", jawaban: "kilam" },
        { tipe: "random", soal: "anmun", jawaban: "manun" }

    ].map(x => ({
        ...x,
        jawaban: x.jawaban.toLowerCase() // memastikan lowercase semua
    }));


    // ================================
    //  ROUTE API
    // ================================

    app.get("/games/susunkata", async (req, res) => {
        const { apikey } = req.query;

        if (!apikey)
            return res.status(400).json({
                status: false,
                error: "apikey is required"
            });

        if (!global.apikey.includes(apikey))
            return res.status(403).json({
                status: false,
                error: "invalid apikey"
            });

        try {
            const item = susunKata[Math.floor(Math.random() * susunKata.length)];

            res.json({
                status: true,
                creator: "Ikyy",
                data: item
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });

};
