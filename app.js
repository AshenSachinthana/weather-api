require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Weather endpoint
app.get("/weather/:city", async (req, res) => {
  try {
    const { city } = req.params;

    // Using OpenWeatherMap API (you'll need to get a free API key)
    const API_KEY = process.env.WEATHER_API_KEY || "demo_key";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await axios.get(url);

    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      timestamp: new Date().toISOString(),
    };

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch weather data",
      message: error.message,
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Weather API is running!",
    endpoints: {
      health: "/health",
      weather: "/weather/:city",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Weather API running on port ${PORT}`);
});
