require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.port || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());


app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});

app.get("/", (req, res) => {
    res.render("home"); 
});
