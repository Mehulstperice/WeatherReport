const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cron = require('node-cron');
const app = express();
const port = 3000;

// Configure PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "WeatherReport",
  password: "123456",
  port: 5000,
});

// OpenWeatherMap API configuration
const API_KEY = 'd48ae8654a1da524e480f857734c74fd'; // Replace with your OpenWeatherMap API key

// Define cities with their lat/lon
const cities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 }
];

// Set the view engine to EJS for rendering pages
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Function to fetch weather data for cities using lat/lon
async function getWeatherData() {
  for (const city of cities) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;

      // Parse response
      const tempCelsius = data.main.temp - 273.15;
      const feelsLikeCelsius = data.main.feels_like - 273.15;
      const weatherCondition = data.weather[0].main;
      const weatherDescription = data.weather[0].description;
      const windSpeed = data.wind.speed;
      const humidity = data.main.humidity;
      const rain = data.rain ? data.rain['1h'] : 0;
      const timestamp = data.dt;

      // Save weather data into PostgreSQL
      await saveWeatherData(
        city.name,
        weatherCondition,
        weatherDescription,
        tempCelsius,
        feelsLikeCelsius,
        humidity,
        windSpeed,
        rain,
        timestamp
      );
      await checkAlerts(city.name, tempCelsius);
    } catch (error) {
      console.error(`Error fetching data for ${city.name}: `, error.message);
    }
  }
}

// Function to save weather data into PostgreSQL
async function saveWeatherData(city, main, description, temp, feelsLike, humidity, windSpeed, rain, dt) {
  const query = `
    INSERT INTO weather_updates (city, main, description, temp, feels_like, humidity, wind_speed, rain, dt) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
  await pool.query(query, [city, main, description, temp, feelsLike, humidity, windSpeed, rain, new Date(dt * 1000)]);
}

// Function to check for alert thresholds
async function checkAlerts(city, temp) {
  const thresholdTemp = 35; // Example threshold
  if (temp > thresholdTemp) {
    console.log(`ALERT: Temperature in ${city} has exceeded ${thresholdTemp}°C`);
    // You can also implement email alerts or other notification mechanisms here
  }
}

// Function to calculate daily weather summaries
async function calculateDailySummary() {
  const query = `
    INSERT INTO daily_weather_summary (city, avg_temp, max_temp, min_temp, dominant_condition, summary_date)
    SELECT
      city,
      AVG(temp) AS avg_temp,
      MAX(temp) AS max_temp,
      MIN(temp) AS min_temp,
      mode() within group (order by main) AS dominant_condition,
      CURRENT_DATE AS summary_date
    FROM weather_updates
    WHERE dt >= NOW() - INTERVAL '1 DAY'
    GROUP BY city
  `;
  await pool.query(query);
}

// Schedule tasks to run every 5 minutes for fetching weather data
cron.schedule('*/5 * * * *', async () => {
  console.log('Fetching weather data...');
  await getWeatherData();
});

// Schedule daily task at midnight to calculate daily weather summary
cron.schedule('0 0 * * *', async () => {
  console.log('Calculating daily weather summary...');
  await calculateDailySummary();
});

// Route for displaying the weather summary
app.get('/', async (req, res) => {
  const query = 'SELECT * FROM daily_weather_summary ORDER BY summary_date DESC LIMIT 10';
  const result = await pool.query(query);
  const summaries = result.rows;

  res.render('index', { summaries });
});

// Start the server
app.listen(port, () => {
  console.log(`Weather monitoring app listening at http://localhost:${port}`);
});
