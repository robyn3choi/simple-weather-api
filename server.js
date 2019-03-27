const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const nodeGeocoder = require('node-geocoder');

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 30 // limit each IP to 30 requests per windowMs
});
//  apply to all requests
app.use(limiter);

var geocoder = nodeGeocoder({
  provider: 'opencage',
  apiKey: process.env.OPENCAGE_SECRET
});

const getWeatherDataFromPosition = (lat, long) => {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${lat},${long}?units=auto&exclude=minutely,hourly,alerts`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      const forecast = assembleForecast(json.daily.data);

      const currentWeather = {
        description: json.currently.summary,
        icon: json.currently.icon,
        temperature: Math.round(json.currently.temperature),
        units: json.flags.units
      }

      return {
        currentWeather: currentWeather,
        forecast: forecast,
        units: json.flags.units
      }
    })
    .catch(err => console.log(err));
}

const assembleForecast = (data) => {
  return data.map((day, i) => {
    const date = new Date(day.time * 1000);
    return {
      weekday: date.getDay(),
      month: date.getMonth(),
      date: date.getDate(),
      description: day.summary,
      icon: day.icon,
      tempHigh: Math.round(day.temperatureHigh),
      tempLow: Math.round(day.temperatureLow),
      wind: Math.round(day.windSpeed),
      precipChance: Math.round(day.precipProbability * 100)
    };
  });
}

// get weather data from city search
app.get('/search', (req, res) => {
  getCoordinates(req.query.placename)
    .then(coords => getWeatherDataFromPosition(coords.lat, coords.long))
    .then(result => res.send(result))
    .catch(err => console.log(err));
});

const getCoordinates = (placename) => {
  return geocoder.geocode(placename)
    .then(res => {
      return { lat: res[0].latitude, long: res[0].longitude };
    })
    .catch(err => console.log(err));
}

// get weather data and place name from position
app.get('/weather', (req, res) => {
  const placeName = geocoder.geocode(`${req.query.lat}, ${req.query.long}`)
    .then(res => res[0].city + ', ' + res[0].state);

  const weatherData = getWeatherDataFromPosition(req.query.lat, req.query.long)
    .then(result => result);

  Promise.all([placeName, weatherData])
    .then(results => {
      results[1].placeName = results[0];
      res.send(results[1]);
    });
});


app.listen(process.env.PORT, () => {
  console.log(`app is running on port ${process.env.PORT}`);
})