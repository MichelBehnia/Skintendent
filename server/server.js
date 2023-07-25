const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const {Configuration, OpenAIApi} = require('openai')
app.use(express.json())
const PORT = process.env.PORT || 5000
const FormData = require('form-data')
const atob = require('atob')
const fs = require('fs')
require('dotenv').config()

const configuration = new Configuration({
    apiKey: process.env.GPT_API_KEY
})
const openai = new OpenAIApi(configuration)

app.use(cors())

app.post('/analyzeSkin', async (req, res) => {
if(req.body.image[0] === "webcam"){

    var base64String = (req.body.image[1]).replace("data:image/jpeg;base64,", "")

    var byteCharacters = atob(base64String);
  
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var arrayBuffer = byteArray.buffer;
  
    var buffer = Buffer.from(arrayBuffer);
  
    fs.writeFileSync('image.jpg', buffer);
  
    var formData = new FormData();
  
    formData.append('image_file', fs.createReadStream('image.jpg'));
  
    axios.post('https://api-us.faceplusplus.com/facepp/v1/skinanalyze', formData, {
      params: {
        api_key: process.env.FACE_API_KEY,
        api_secret: process.env.FACE_API_SECRET
      },
      maxContentLength: Infinity,
      headers: {
        ...formData.getHeaders()
      }
    }).then((apiResponse) => {
      console.log(apiResponse.data)
      res.send(apiResponse.data)
    }).catch((error) => {
      console.error(error)
      res.send(error.response.data)
    })
  } 
})

const promptContext = process.env.GPT_API_PROMPT 

app.post('/skinAdvice', async (req, res) => {
    try {
        const aiResponse = await openai.createChatCompletion ({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: promptContext},
                {role: "user", content: req.body.imperfections}
            ],
            temperature: 0
        })

        res.send(aiResponse.data.choices[0].message.content)

    } catch (error) {
        console.error(error)
    }

})

app.post('/searchForProducts', async (req, res) => {
  let products = []
  for(let i = 0; i <  req.body.productsToSearch.length; i++) {
    await axios.get("https://amazon23.p.rapidapi.com/product-search", {
      params: {
        query: req.body.productsToSearch[i]
      },
      headers: {
        'X-RapidAPI-Key': process.env.TP_AMAZON_API_KEY,
        'X-RapidAPI-Host': process.env.TP_AMAZON_API_HOST
      }
    }).then((apiResponse) => {
      console.log(apiResponse.data)
      let topFiveProducts = []
      let numberOfIterations = 5
      for(let i = 0; i < numberOfIterations; i++){
        if(apiResponse.data.result[i].title.indexOf("Sponsored") !== -1){
          numberOfIterations++
        } else{
          topFiveProducts.push(apiResponse.data.result[i])
        }
      }
      products.push([req.body.productsToSearch[i], topFiveProducts])
      if(i+1 === req.body.productsToSearch.length){
        return res.send(products)
      }
    }).catch((error) => {
      console.error(error)
      return res.send(error.response.data)
    })
  }
})

app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
  }
})
