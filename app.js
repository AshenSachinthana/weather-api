require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve index.html
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

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Weather API running on port ${PORT}`);
  });
  
  // Graceful shutdown for production
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}

module.exports = app;