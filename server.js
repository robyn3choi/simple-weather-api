const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors()); 

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/currentweather', (req, res) => {
  getCurrentWeatherFromPos(req.query.lat, req.query.long).then(result => res.send(result));
});

const getCurrentWeatherFromPos = (lat, long) => {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${lat},${long}?units=auto`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      return {
        description: json.currently.summary,
        icon: json.currently.icon,
        temperature: Math.round(json.currently.temperature)
      }
    });
}

app.get('/forecast', (req, res) => {
  getForecastFromPos(req.query.lat, req.query.long).then(result => res.send(result));
});

const getForecastFromPos = (lat, long) => {
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
          tempHigh:  Math.round(day.temperatureHigh),
          tempLow:  Math.round(day.temperatureLow),
          wind:  Math.round(day.windSpeed),
          precipChance: Math.roung(day.precipProbability * 100)
        };
      })
    });
}

app.listen(process.env.PORT, ()=> {
  console.log(`app is running on port ${process.env.PORT}`);
})