require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const cropData = {
    "Sunny": {
        "10-20°C": ["Wheat", "Barley", "Mustard"],
        "20-30°C": ["Maize", "Sorghum", "Sunflower"],
        "30-40°C": ["Rice", "Millets", "Sugarcane"]
    },
    "Rainy": {
        "10-20°C": ["Peas", "Lettuce", "Cauliflower"],
        "20-30°C": ["Paddy", "Soybean", "Groundnut"],
        "30-40°C": ["Banana", "Turmeric", "Jute"]
    },
    "Cold": {
        "0-10°C": ["Carrots", "Cabbage", "Spinach"],
        "10-20°C": ["Wheat", "Oats", "Chickpeas"]
    },
    "Haze": {
        "10-20°C": ["Garlic", "Onion", "Fenugreek"],
        "20-30°C": ["Tomato", "Brinjal", "Okra"],
        "30-40°C": ["Chili", "Cucumber", "Pumpkin"]
    }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());


app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/crop",(req,res)=>{
    res.render("crop",{cropData});
});

app.post("/crop",(req,res)=>{
    let {city,weatherCondition,temperature} = (req.body);
    let tempRange = Object.keys(cropData[weatherCondition] || {}).find(range => {
        let [min, max] = range.replace("°C", "").split("-").map(Number);
        return temperature >= min && temperature <= max;
    });
    let crops = tempRange ? cropData[weatherCondition][tempRange] : [];
    res.render("crop", {city ,crops}); 
});

app.get("/back", (req, res) => {
    res.redirect("/");
});


