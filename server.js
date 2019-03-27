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

// app.get('/', (req, res) => res.send('Hello World!'))

const getCurrentWeather = (lat, long) => {
  //TODO REMOVE
  return Promise.resolve({
    description: 'Partly cloudy',
    icon: 'cloudy',
    temperature: 12
  });
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${lat},${long}?units=auto`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      return {
        description: json.currently.summary,
        icon: json.currently.icon,
        temperature: Math.round(json.currently.temperature)
      }
    })
    .catch(err => console.log(err));
}

const getForecast = (lat, long) => {
  //TODO REMOVE
  return Promise.resolve([
    {
      weekday: 0,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'fog',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 1,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'hail',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 2,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'sleet',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 3,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'snow',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 4,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'thunderstorm',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 5,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'tornado',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 6,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'wind',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
    {
      weekday: 0,
      month: 0,
      date: 20,
      description: 'Partly cloudy throughout the day.',
      icon: 'wind',
      tempHigh: 20,
      tempLow: 2,
      wind: 10,
      precipChance: 100
    },
  ]);
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${lat},${long}?units=auto&exclude=currently,minutely,hourly,alerts,flags`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      return json.daily.data.map((day, i) => {
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
      })
    })
    .catch(err => console.log(err));
}

// get weather data from city search
app.get('/citysearch', (req, res) => {
  getCoordinates(req.query.placename)
    .then(coords => getCurrentWeatherAndForecast(coords))
    .then(result => res.send(result))
    .catch(err => console.log(err));
});

const getCoordinates = (placename) => {
  //TODO REMOVE
  return Promise.resolve({ lat: 100, long: 100 });
  return geocoder.geocode(placename)
    .then(res => {
      return { lat: res[0].latitude, long: res[0].longitude };
    })
    .catch(err => console.log(err));
}

const getCurrentWeatherAndForecast = (coords) => {
  const currentWeather = getCurrentWeather(coords.lat, coords.long);
  const forecast = getForecast(coords.lat, coords.long);

  return Promise.all([currentWeather, forecast])
    .then(results => {
      return { currentWeather: results[0], forecast: results[1] };
    });
}

// get weather data and place name from position
app.get('/weather', (req, res) => {
  const coords = { lat: req.query.lat, long: req.query.long };

  const placeName = geocoder.geocode(`${coords.lat}, ${coords.long}`)
    .then(res => res[0].city + ', ' + res[0].state);

  const weatherData = getCurrentWeatherAndForecast(coords)
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