const axios = require("axios")

module.exports = function (app) {

  app.get("/download/spotify", async (req, res) => {
    try {
      const { apikey, query } = req.query

      // VALIDASI
      if (!apikey)
        return res.json({ status:false, message:"apikey required" })

      if (!global.apikey.includes(apikey))
        return res.json({ status:false, message:"invalid apikey" })

      if (!query)
        return res.json({ status:false, message:"query required" })

      // REQUEST KE API SUMBER
      const apiURL = `https://api.deline.web.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`
      const response = await axios.get(apiURL)

      const data = response.data

      // CEK RESPONSE VALID
      if (!data.status || !data.result) {
        return res.json({
          status:false,
          message:"track not found / API error",
          info: data
        })
      }

      const result = data.result

      // OUTPUT RAPIH
      res.json({
        status: true,
        creator: "IkyyOfficial",
        result: {
          title: result.metadata.title,
          artist: result.metadata.artist,
          duration: result.metadata.duration,
          cover: result.metadata.cover,
          url: result.metadata.url,
          download: result.dlink
        }
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
