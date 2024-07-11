const express = require('express');

// Handles making HTTP requests to external APIs.
const axios = require('axios');

// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
//  Manages environment variables to keep sensitive data secure and configuration flexible.
const dotenv = require('dotenv');

dotenv.config();

const server = express();

server.get('/api/hello', async (req, res) => {
    let visitor_name = req.query.visitor_name;
    let apiKey = process.env.LOCATION_API_KEY
    let weatherApiKey = process.env.WEATHER_API_KEY;

    /* Without this ipify, I got error 423-which indicated that the ip the geolocation api was getting was a
     bogon( Bogons are IP addresses that should not be routable on the public internet, such as private IP
    ranges or reserved addresses) ip address. So, this was used to get the correct IP address of the client. 
    Using this, geolocation would query the ip address to then get the location.
     */
    let ipifyResponse = await axios.get('https://api.ipify.org?format=json');

    // The (.) is used to specify the particular property we want to access or make use of
    let client_ip = ipifyResponse.data.ip;

    // Construct the URL for the geolocation API
    /* Read the ipgeolocation documentation and checked for the base url and ip and city as properties of the 
        url. Used the backtick cuz the process.env... can't be inserted as strings ordinarily. 
    */
    let ipGeoUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${client_ip}&fields=city`;

    try {
        let response = await axios.get(ipGeoUrl);
        let location = response.data.city || 'Location not found';

        // Construct the URL for the weather API
        // The q parameter is needed to access the property, I guess
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