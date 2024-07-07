const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const server = express();

server.get('/api/hello', async (req, res) => {
    let visitor_name = req.query.visitor_name;
    let apiKey = process.env.LOCATION_API_KEY
    let weatherApiKey = process.env.WEATHER_API_KEY;

    let ipifyResponse = await axios.get('https://api.ipify.org?format=json');
    let client_ip = ipifyResponse.data.ip;

    // Construct the URL for the geolocation API
    let ipGeoUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${client_ip}&fields=city`;

    try {
        let response = await axios.get(ipGeoUrl);
        let location = response.data.city || 'Location not found';

        // Construct the URL for the weather API
        let weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location}`

        let response2 = await axios.get(weatherUrl);
        let temperature = response2.data.current.temp_c || 'Location not found';

        res.json({
            "client_ip": `${client_ip}`, // The IP address of the requester
            "location": `${location}`, // The city of the requester
            "greeting": `Hello, ${visitor_name}!, the temperature is ${temperature} degrees Celcius in ${location}`
        })

    } catch (err) {
        res.status(500).json({ Error: err.message })
    }


})

const port = process.env.PORT || 3300
server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})