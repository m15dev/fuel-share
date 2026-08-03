import { supabaseClient } from './database.js';

// ==========================================================================
// 1. DADOS DE ENTRADA & MASKING
// ==========================================================================
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

// ==========================================================================
// 2. FUNÇÃO DE ENVIO PARA O SUPABASE (TABELA 'reports')
// ==========================================================================
export async function reportPriceByName(stationId, preco, tipoCombustivel, metodoPagamento = 1) {
    // Garantindo tipos de dados numéricos para o banco
    const fuelTypeInt = parseInt(tipoCombustivel, 10) || 1;
    const paymentMethodInt = parseInt(metodoPagamento, 10) || 1;

    const { data, error } = await supabaseClient
        .from('reports') 
        .insert([
            { 
                price: preco,                 // numeric
                fuel_type: fuelTypeInt,       // int2
                station_id: stationId,        // uuid
                payment_method: paymentMethodInt // int2 (Adicionado para satisfazer a constraint NOT NULL)
            }
        ]);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// ==========================================================================
// 3. GEOLOCALIZAÇÃO + OVERPASS API
// ==========================================================================
navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(`Location: ${lat}, ${lon}`);

    const query = `
        [out:json][timeout:15];
        (
            node["amenity"="fuel"](around:10000,${lat},${lon});
            way["amenity"="fuel"](around:10000,${lat},${lon});
            relation["amenity"="fuel"](around:10000,${lat},${lon});
        );
        out center;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Erro no servidor de postos (Status ${response.status})`);
        }

        const data = await response.json();

        if (data && data.elements) {
            data.elements.forEach((station) => {
                const name = station.tags.name || "Posto sem Nome";
                console.log(`Station Name: ${name}`);
            });
        }

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.warn("⚠️ O servidor da Overpass demorou demais para responder (Timeout de 6s).");
        } else {
            console.error("❌ Erro ao buscar postos:", error.message);
        }
    }
}, (geoError) => {
    console.error("Erro ao obter geolocalização do dispositivo:", geoError);
});

// ==========================================================================
// 4. LÓGICA DE SELEÇÃO E SUBMISSÃO DE PREÇO
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

        // UUID temporário de teste ou ID do posto retornado pela busca (tabela 'stations')
        const dummyStationId = "2c89ee2e-af6e-4dc7-bb80-cde6a2ff5e82";

        publishButton.innerText = "SENDING...";
        publishButton.disabled = true;

        try {
            await reportPriceByName(dummyStationId, numericPrice, selectedFuelType);
            console.log("Price successfully published in real-time!");
            
            document.getElementById("fuel-price-input").value = "";
            fuelCards.forEach(c => c.style.border = 'none');
            selectedFuelType = null;
            
            if (typeof trocarPagina === "function") {
                trocarPagina('page-home');
            }
        } catch (err) {
            console.error("Erro ao enviar preço para o Supabase:", err);
            alert("Erro ao publicar preço: " + err.message);
        } finally {
            publishButton.innerText = "PUBLICAR PREçO";
            publishButton.disabled = false;
        }
    });
}

function updatePriceTrend(oldPrice, newPrice) {
    const trendElement = document.getElementById("price-trend-tool");
    if (!trendElement) return; 

    const diference = newPrice - oldPrice;
    trendElement.classList.remove("up", "down");

    if (diference > 0) {
        trendElement.classList.add("up");
        trendElement.innerText = `▲ +R$${diference.toFixed(2)} esta semana`;
    } 
    else if (diference < 0) { 
        trendElement.classList.add("down");
        trendElement.innerText = `▼ -R$${Math.abs(diference).toFixed(2)} esta semana`;
    } 
    else {
        trendElement.innerText = ` R$${newPrice.toFixed(2)} sem alterações`;
    }
}

function calcularTempoDecorrido(dataPostagem) {
    const agora = new Date();
    const postagem = new Date(dataPostagem);
    
    const diferencaMilissegundos = agora - postagem;
    
    const diferencaMinutos = Math.floor(diferencaMilissegundos / (1000 * 60));
    const diferencaHoras = Math.floor(diferencaMilissegundos / (1000 * 60 * 60));
    const diferencaDias = Math.floor(diferencaMilissegundos / (1000 * 60 * 60 * 24));

    if (diferencaMinutos < 1) {
        return "Atualizado agora mesmo";
    } else if (diferencaMinutos < 60) {
        return `Atualizado há ${diferencaMinutos} min`;
    } else if (diferencaHoras < 24) {                                   
        return `Atualizado há ${diferencaHoras} ${diferencaHoras === 1 ? 'hora' : 'horas'}`;
    } else {
        return `Atualizado há ${diferencaDias} ${diferencaDias === 1 ? 'dia' : 'dias'}`;
    }
}

export async function carregarDadosDoBanco() {
    try {
        const { data: reports, error } = await supabaseClient
            .from('reports')
            .select('price, created_at')
            .order('created_at', { ascending: false })
            .limit(2);

        if (error) throw error;

        if (reports && reports.length > 0) {
            const ultimoRegistro = reports[0];
            const precoAtual = ultimoRegistro.price;
            
            // Tempo decorrido real
            const elementoTempo = document.getElementById("lastUpdated");
            if (elementoTempo) {
                elementoTempo.innerText = calcularTempoDecorrido(ultimoRegistro.created_at);
            }

            // Cálculo da tendência
            if (reports.length > 1) {
                const precoAnterior = reports[1].price;
                updatePriceTrend(precoAnterior, precoAtual);
            } else {
                updatePriceTrend(precoAtual, precoAtual);
            }

            // Atualização do preço exibido na tela principal
            const elementoPrecoPrincipal = document.querySelector('.fuel-price');
            if (elementoPrecoPrincipal) {
                elementoPrecoPrincipal.innerText = `${precoAtual.toFixed(2).replace('.', ',')}`;
            }
        }
    } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err.message);
    }
}