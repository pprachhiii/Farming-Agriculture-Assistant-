document.addEventListener("DOMContentLoaded", () => {
    const fetch_weather_btn = document.querySelector(".fetch-weather-btn");
    const locationInput = document.querySelector(".location-input");
    const weatherData = document.querySelector(".weather-data");
    const cropButton = document.querySelector("#get-crop-btn");
    let weatherFetched = false;

    function addHiddenInput(name, value) {
        let input = document.querySelector(`input[name='${name}']`);
        if (input) {
            input.remove(); // Remove old input
        }
        if (!input) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            document.querySelector("form").appendChild(input);
        }
        input.value = value;
    }
   
    async function getWeather(city) {
        const url = `https://wttr.in/${city}?format=%C+%t`;

        try {
            const res = await axios.get(url);
            const weatherInfo = res.data.split(" ");
            const weatherCondition = weatherInfo.slice(0, -1).join(" "); // Handle multi-word condition
            const temperature = parseInt(weatherInfo.at(-1).replace("°C", ""));
            
            weatherData.textContent = `Weather in ${city}: ${weatherCondition}, ${temperature}°C`;

            addHiddenInput("city", city);
            addHiddenInput("weatherCondition", weatherCondition);
            addHiddenInput("temperature", temperature);
            weatherFetched = true; 
            } catch (e) {
            weatherData.textContent = "Error fetching weather data.";
            weatherFetched = false;
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
    
});