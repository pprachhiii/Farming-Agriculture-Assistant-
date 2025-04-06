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
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
}).promise();

const app = express();
const port = process.env.DB_PORT || 3000;
const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.render("home");
});
app.get("/weather", (req, res) => {
    res.render("weather", { forecast: null, city: null, error: null });
});
app.get("/back", (req, res) => {
    res.render("weather", { forecast: null, city: null, error: null });
});

app.get("/test-db", async (req, res) => {
    try {
      const [rows] = await pool.query("SHOW TABLES");
      console.log("Connecting to DB with config:", {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
      });
      
      res.json(rows);
    } catch (err) {
      console.error("DB test error:", err);
      console.log("Connecting to DB with config:", {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
      });      
      res.status(500).send("DB connection failed.");
    }
  });
  
app.post("/weather", async (req, res) => {
    const city = req.body.city;

    console.log("City received in /weather route:", city); // Debugging

    if (!city) {
        return res.render("weather", { forecast: null, city: null, error: "Please enter a city name!" });
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

        res.render("weather", { city, forecast: dailyForecast, error: null });
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.render("weather", { forecast: null, city: null, error: "Unable to fetch weather data." });
    }
});
// Crop Recommendation Route
app.get("/crop", (req, res) => {
    
    res.render("crop", { crops: null, city: null, weatherCondition: null, temperature: null, error: null });
});
app.get("/crop/:recommended", async (req, res) => {
    const { recommended } = req.params;
    const { city, weatherCondition, temperature } = req.query; // Get data from URL

    try {
        const query = "SELECT * FROM crop_care_tips WHERE crop_name = ?";
        const [rows] = await pool.query(query, [recommended]);

        if (rows.length === 0) {
            return res.render("show", { 
                crop: null, city, weatherCondition, temperature,
                error: "No care tips found for this crop." 
            });
        }

        const cropDetails = rows[0];

        res.render("show", { crop: cropDetails, city, weatherCondition, temperature, error: null });

    } catch (error) {
        console.error("Error fetching crop care tips:", error);
        res.render("show", { crop: null, city, weatherCondition, temperature, error: "An error occurred while fetching crop details." });
    }
});

app.post("/crop", async (req, res) => {
    const { city, weatherCondition, temperature ,soil} = req.body;

    if (!city || !soil) {
        return res.render("crop", { crops: null, city, weatherCondition, temperature, error: "Please enter a valid city and select a soil type!" });
    }

    try {
        // Query to fetch recommended crops based on city and soil type
        const query = `SELECT recommended_crops FROM crop_recommendations 
        WHERE city = ? 
        AND FIND_IN_SET(?, REPLACE(soil_types, '|', ','))`;

        const [rows] = await pool.query(query, [city, soil]);

        if (rows.length === 0) {
        return res.render("crop", { crops: null, city, weatherCondition, temperature, error: "No suitable crops found for this city and soil type." });
        }

        const recommendedCrops = rows[0].recommended_crops.split("|");

        const cropImages = await getImagesForCrops(recommendedCrops);

        res.render("crop", { crops: cropImages, city, weatherCondition, temperature, error: null });

    } catch (error) {
        console.error("Database error:", error);
        res.render("crop", { crops: null, city, weatherCondition, temperature, error: "Error retrieving crop data from the database." });
    }
});
async function getImagesForCrops(crops){
    const url = 'https://api.pexels.com/v1/search';
    const apiKey = process.env.PIXELS_API_KEY;
    try{
        const imageResults = await Promise.all(crops.map(async (crop) => {
            try {
                const res = await axios.get(url, {
                    headers: { Authorization: apiKey },
                    params: { query: crop, per_page: 1 }
                });

                return {
                    crop: crop,  
                    image: res.data.photos.length > 0 ? res.data.photos[0].src.medium : null
                };
            } catch (error) {
                console.error(`Error fetching image for ${crop}:`, error);
                return { crop: crop, image: null };
            }
        }));

        return imageResults;
    } catch (e) {
        console.error("Error fetching images:", e);
        return crops.map(crop => ({ crop, image: null }));
    }
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});