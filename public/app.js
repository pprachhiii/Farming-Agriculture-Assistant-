document.addEventListener("DOMContentLoaded", () => {
    const cropForm = document.querySelector("#crop-form");
    
    cropForm.addEventListener("submit", (event) => {
        console.log("Form submitted!");
        
        // Debugging logs
        const city = document.querySelector("input[name='city']").value;
        const soil = document.querySelector("#soil").value;

        console.log("City:", city);
        console.log("Soil:", soil);

        if (!soil) {
            alert("Please select a soil type.");
            event.preventDefault();  // Stop form submission if soil is missing
        }
    });
});
