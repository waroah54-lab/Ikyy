const axios = require("axios")

module.exports = function (app) {

  app.get("/ai/openai", async (req, res) => {
    try {
      const { apikey, text } = req.query

      if (!global.apikey) global.apikey = [] // prevent crash

      if (!apikey)
        return res.json({ status:false, message:"apikey required" })

      if (!global.apikey.includes(apikey))
        return res.json({ status:false, message:"invalid apikey" })

      if (!text)
        return res.json({ status:false, message:"text required" })

      const prompt =
        "Kamu adalah IkyyAssistant Yang Pintar Dalam Pemrograman, tolong cek kan code yang erorr di atas dan kasih penjelasan"

      const url =
        `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`

      const response = await axios.get(url).catch(e => ({ data:null }))
      const data = response.data

      if (!data || data.status !== true) {
        return res.json({
          status:false,
          message:"AI processing failed",
          info:data
        })
      }

      res.json({
        status:true,
        creator:"IkyyOfficial",
        result:data.result
      })

    } catch (err) {
      res.json({
        status:false,
        message:"server error",
        error: err.message
      })
    }
  })

}
