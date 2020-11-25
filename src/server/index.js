require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rovers', async (req, res) => {
    try { 
        const url = `https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${process.env.API_KEY}`
        console.log(url)
        let rovers = await fetch(url)
        rovers = await rovers.json();
        res.send(rovers)
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rovers/:name', async (req, res) => {
    try {
        const dateNow = new Date();
        const cDate = `${dateNow.getFullYear()}-${dateNow.getMonth() + 1}-${dateNow.getDate() - 1}`
        
        const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/photos?earth_date=${cDate}&api_key=${process.env.API_KEY}`
        console.log(url)
        let image = await fetch(url)
        image = await image.json();
            console.log(image);
        res.send(image)
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))