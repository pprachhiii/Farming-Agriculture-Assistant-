const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
}).promise();

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
    res.render("crop", { crops: null, city: null, weatherCondition: null, temperature: null, error: null });
});

app.post("/crop", async (req, res) => {
    const { city, weatherCondition, temperature ,soil} = req.body;
    
    if (!city || !soil) {
        return res.render("crop", { crops: null, city, weatherCondition, temperature, error: "Please enter a valid city and select a soil type!" });
    }

    try {
        // Query to fetch recommended crops based on city and soil type
        const [rows] = await pool.query(
            `SELECT recommended_crops FROM crop_recommendations 
             WHERE city = ? 
             AND FIND_IN_SET(?, REPLACE(soil_types, '|', ','))`, 
            [city, soil]
        );

        if (rows.length === 0) {
            return res.json({ error: "No suitable crops found for this city and soil type." });
        }

        const recommendedCrops = rows[0].recommended_crops.split("|");

        res.render("crop", { crops: recommendedCrops, city, weatherCondition, temperature, error: null });

    } catch (error) {
        console.error("Database error:", error);
        res.render("crop", { crops: null, city, weatherCondition, temperature, error: "Error retrieving crop data from the database." });
    }

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});