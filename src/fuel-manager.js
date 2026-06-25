const input = document.getElementById("fuel-price-input");

input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "");

    if (!value) {
        input.value = "";
        return;
    }

    value = value.slice(0, 4);

    value = (parseInt(value, 10) / 100).toFixed(2);

    input.value = value.replace(".", ",");
});

//Converting it back to shove it up to supabase
const price = parseFloat(
    input.value.replace(",", ".")
);



//EXTRA EXTRA EXTRA EXTRA __ TESTE //

navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(`Location: ${lat}, ${lon}`);

    const query = `
        [out:json];
        (
            node["amenity"="fuel"](around:1000,${lat},${lon});
            way["amenity"="fuel"](around:1000,${lat},${lon});
            relation["amenity"="fuel"](around:1000,${lat},${lon});
        );
        out center;
    `;

    try {
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: query
            }
        );

        const data = await response.json();

        console.log("Nearby fuel stations:");
        console.log(data.elements);

        data.elements.forEach((station) => {
            console.log(
                station.tags?.name || "Unnamed Station"
            );
        });

    } catch (error) {
        console.error("Error:", error);
    }
});