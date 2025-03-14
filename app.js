const API_KEY = "your_api_key_here"; 
const areaInput = document.querySelector(".areaInput");
const weatherDisplay = document.querySelector(".showsWeather");

async function getWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try{
     const res = await axios.get(url);
     const data = res.data;
     console.log(data);
    }catch(e){
        console.error("Error fetching weather data:", e);
    }
}