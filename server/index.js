const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.render("home", { forecast: null, city: null, error: null });
});
app.get("/back", (req, res) => {
    res.render("home", { forecast: null, city: null, error: null });
});

app.post("/", async (req, res) => {
    const city = req.body.city;
    
    if (!city) {
        return res.render("home", { forecast: null, city: null, error: "Please enter a city name!" });
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const forecastData = response.data.list;
        const dailyForecast = [];

        // Extract only 12:00 PM data for each day
        const dates = new Set();
        forecastData.forEach((entry) => {
            const date = entry.dt_txt.split(" ")[0];
            if (!dates.has(date) && entry.dt_txt.includes("12:00:00")) {
                dailyForecast.push({
                    date,
                    temperature: entry.main.temp,
                    weatherCondition: entry.weather[0].description,
                    icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`
                });
                dates.add(date);
            }
        });

        res.render("home", { city, forecast: dailyForecast, error: null });
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.render("home", { forecast: null, city: null, error: "Unable to fetch weather data." });
    }
});

// Crop Recommendation Route
app.get("/crop", (req, res) => {
    res.render("crop", { crops: null });
});

app.post("/crop", async (req, res) => {
    const { city, weatherCondition, temperature } = req.body;

    // Dummy crop recommendation logic (You can replace it with real logic)
    const cropRecommendations = {
        "clear sky": ["Wheat", "Corn", "Rice"],
        "rain": ["Rice", "Sugarcane", "Soybean"],
        "snow": ["Carrots", "Potatoes", "Cabbage"]
    };

    const crops = cropRecommendations[weatherCondition] || ["General Crops"];

    res.render("crop", { city, crops });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
