const fetch_weather_btn = document.querySelector("fetch-weather-btn");
const locationInput = document.querySelector(".location-input");
const weatherData = document.querySelector(".weather-data");
const cropData = document.querySelector(".crop-data");

async function getWeather(city) {
    const url = `https://wttr.in/${city}?format=%C+%t`;

    try {
        const res = await axios.get(url);
        weatherData.textContent = `Weather in ${city}: ${res.data}`;
    } catch (e) {
        weatherData.textContent = "Error fetching weather data.";
    }
}

fetch_weather_btn.addEventListener("click", async (e) => {
    e.preventDefault(); 
    const city = locationInput.value.trim();
    if (!city) {
        alert("Enter a city");
        return;
    }

    await getWeather(city);
});
