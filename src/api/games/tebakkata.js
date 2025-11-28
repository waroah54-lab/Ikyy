const axios = require("axios");

module.exports = function (app) {

    // 📌 BANK SOAL TEBAK KATA
    const bankTebakKata = [
        // Hewan
        { soal: "Hewan apa yang suka wortel dan telinganya panjang?", jawaban: "kelinci", tipe: "hewan" },
        { soal: "Hewan apa yang disebut raja hutan?", jawaban: "singa", tipe: "hewan" },
        { soal: "Hewan bercula satu?", jawaban: "badak", tipe: "hewan" },

        // Makanan
        { soal: "Makanan berkuah dari Jepang memakai mie?", jawaban: "ramen", tipe: "makanan" },
        { soal: "Makanan bulat sering ada di pizza?", jawaban: "keju", tipe: "makanan" },
        { soal: "Makanan dari kedelai yang difermentasi?", jawaban: "tempe", tipe: "makanan" },

        // Barang / Benda
        { soal: "Benda untuk melihat waktu?", jawaban: "jam", tipe: "barang" },
        { soal: "Benda untuk menulis selain pensil?", jawaban: "pulpen", tipe: "barang" },
        { soal: "Alat untuk memotong kertas?", jawaban: "gunting", tipe: "barang" },

        // Negara
        { soal: "Negara dengan Menara Eiffel?", jawaban: "prancis", tipe: "negara" },
        { soal: "Negara mata uang yen?", jawaban: "jepang", tipe: "negara" },
        { soal: "Negara bendera merah putih selain Indonesia?", jawaban: "monako", tipe: "negara" },

        // Tumbuhan
        { soal: "Tumbuhan berduri dan hidup di gurun?", jawaban: "kaktus", tipe: "tumbuhan" },
        { soal: "Tumbuhan penghasil oksigen?", jawaban: "pohon", tipe: "tumbuhan" },
        { soal: "Buah tropis kulit berduri?", jawaban: "durian", tipe: "tumbuhan" },

        // Pekerjaan
        { soal: "Orang yang mengajar murid?", jawaban: "guru", tipe: "pekerjaan" },
        { soal: "Orang yang membuat bangunan?", jawaban: "tukang", tipe: "pekerjaan" },
        { soal: "Orang yang menyetir pesawat?", jawaban: "pilot", tipe: "pekerjaan" },
    ];

    // 📌 ENDPOINT
    app.get("/games/tebakkata", async (req, res) => {
        const soal = bankTebakKata[Math.floor(Math.random() * bankTebakKata.length)];

        res.json({
            status: true,
            creator: "Ikyy",
            data: soal
        });
    });
};
