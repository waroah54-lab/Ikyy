const fetch = require("node-fetch")

module.exports = function (app) {

  app.get("/tools/kurs", async (req, res) => {
    try {
      const { apikey, from, to, amount } = req.query

      // VALIDASI
      if (!apikey) return res.json({ status:false, message:"apikey required" })
      if (!from) return res.json({ status:false, message:"from currency required" })
      if (!to) return res.json({ status:false, message:"to currency required" })
      if (!amount || isNaN(amount)) {
        return res.json({ status:false, message:"amount must be a number" })
      }

      // API SUMBER (TANPA ACCESS_KEY)
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`

      const fx = await fetch(url).then(r => r.json())

      // CEK DATA VALID
      if (!fx || typeof fx.result !== "number") {
        return res.json({
          status:false,
          message:"conversion failed",
          source: fx
        })
      }

      // OUTPUT FINAL TANPA ADA RAW JSON
      return res.json({
        status: true,
        creator: "IkyyOfficial",
        result: {
          dari: from.toUpperCase(),
          ke: to.toUpperCase(),
          jumlah: Number(amount),
          hasil: fx.result
        }
      })

    } catch (e) {
      return res.json({
        status:false,
        message:"server error",
        error:e.message
      })
    }
  })
}
