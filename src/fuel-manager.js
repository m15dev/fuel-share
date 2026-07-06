const input = document.getElementById("fuel-price-input");
const elemento = document.getElementById("cck-1");
const elemento2 = document.getElementById("cck-2");

if (input) {
    input.addEventListener("input", () => {
        let value = input.value.replace(/\D/g, "");

        if (!value) {
            input.value = "";
            return;
        }

        value = value.slice(0, 4);
        value = (parseInt(value, 10) / 100).toFixed(2);
        input.value = value.replace(".", ",");

        if (elemento) elemento.style.color = "white";
        if (elemento2) elemento2.style.color = "white";
    });
}

function obterPrecoParaSupabase() {
    if (input && input.value) {
        return parseFloat(input.value.replace(",", "."));
    }
    return 0;
}

//EXTRA EXTRA EXTRA EXTRA __ TESTE //
navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(`Location: ${lat}, ${lon}`);

    const query = `
        [out:json];
        (
            node["amenity"="fuel"](around:10000,${lat},${lon});
            way["amenity"="fuel"](around:10000,${lat},${lon});
            relation["amenity"="fuel"](around:10000,${lat},${lon});
        );
        out center;
    `;

    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error: ${response.status} - ${text}`);
        }

        const data = await response.json();

        data.elements.forEach((station) => {
            const name = station.tags.name || "Unnamed Station";
            console.log(`Station Name: ${name}`);
            console.log("Full Details:", station);
        });

    } catch (error) {
        console.error("Error fetching stations:", error);
    }
});