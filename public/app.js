document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#weather-form");
    const locationInput = document.querySelector(".location-input");
    const weatherSection = document.querySelector(".weather-info");
    const loader = document.createElement("div");

    loader.innerHTML = "Fetching Weather...⏳";
    loader.classList.add("loader");
    loader.style.display = "none";
    form.insertAdjacentElement("afterend", loader);

    form.addEventListener("submit", async (event) => {
        if (!locationInput.value.trim()) {
            event.preventDefault();
            alert("Please enter a city or region.");
            return;
        }

        loader.style.display = "block"; // Show loader
        weatherSection.style.display = "none"; // Hide previous weather info
    });

    if (weatherSection) {
        weatherSection.style.display = "block";
        loader.style.display = "none"; // Hide loader when data is loaded
    }
});
