const input = document.getElementById("fuel-price-input");
const elemento = document.getElementById("cck-1");
const elemento2 = document.getElementById("cck-2")

let combustivelSelecionado = null;


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

//EXTRA EXTRA EXTRA EXTRA __ TESTE // NEED TO WORK ON HERE CUS SMT IT JUST GIVE A RAMDOM ERROR
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




// ==========================================================================
// FUEL PRICE SUBMISSION LOGIC
// ==========================================================================

let selectedFuelType = null;
const fuelCards = document.querySelectorAll('.fuel-pannel-grid .fuel-card');
const publishButton = document.getElementById('btn-1');

fuelCards.forEach(card => {
    card.addEventListener('click', () => {

        fuelCards.forEach(c => c.style.border = 'none');
        
        card.style.border = '2px solid var(--text-logo)';

        selectedFuelType = card.getAttribute('data-fuel');
        console.log("Selected fuel type ID:", selectedFuelType);
    });
});

if (publishButton) {
    publishButton.addEventListener('click', async () => {
        if (selectedFuelType === null) {
            alert("Please, select a fuel type first!");
            return;
        }

        const numericPrice = obterPrecoParaSupabase();
        if (!numericPrice || numericPrice <= 0) {
            alert("Please, enter a valid price!");
            return;
        }

        const stationName = "POSTO BRASIL"; 

        publishButton.innerText = "SENDING...";
        publishButton.disabled = true;

       await reportPriceByName(stationName, numericPrice);

        console.log("Price successfully published in real-time!");
        
        document.getElementById("fuel-price-input").value = "";
        fuelCards.forEach(c => c.style.border = 'none');
        selectedFuelType = null;
        
        if (typeof trocarPagina === "function") {
            trocarPagina('page-home');
        }

        publishButton.innerText = "PUBLISH PRICE";
        publishButton.disabled = false;
    });
}