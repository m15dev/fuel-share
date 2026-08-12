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
    const fuelTypeInt = parseInt(tipoCombustivel, 10) || 1;
    const paymentMethodInt = parseInt(metodoPagamento, 10) || 1;

    const { data, error } = await supabaseClient
        .from('reports') 
        .insert([
            { 
                price: preco,                 // numeric
                fuel_type: fuelTypeInt,       // int2
                station_id: stationId,        // uuid ou id do posto
                payment_method: paymentMethodInt // int2
            }
        ]);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// ==========================================================================
// 3. GEOLOCALIZAÇÃO & POSTOS MAIS PRÓXIMOS (HAVERSINE + OVERPASS)
// ==========================================================================
let postosProximos = [];
let postoSelecionadoId = null;

// Formula de Haversine para calcular distancia em KM
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function buscarPostosProximos() {
    if (!navigator.geolocation) {
        console.error("Geolocalização não é suportada por este dispositivo.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        console.log(`User Lat/Lon: ${userLat}, ${userLon}`);

        const query = `
            [out:json][timeout:15];
            (
                node["amenity"="fuel"](around:10000,${userLat},${userLon});
                way["amenity"="fuel"](around:10000,${userLat},${userLon});
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
                throw new Error(`Erro Overpass API (Status ${response.status})`);
            }

            const data = await response.json();

            if (data && data.elements) {
                // Mapeia e calcula a distância para cada posto encontrado
                postosProximos = data.elements.map(station => {
                    const stLat = station.lat || (station.center && station.center.lat);
                    const stLon = station.lon || (station.center && station.center.lon);
                    const nome = station.tags.name || station.tags.brand || "Posto sem Nome";
                    const distancia = calcularDistanciaKm(userLat, userLon, stLat, stLon);

                    return {
                        id: station.id,
                        nome: nome,
                        distancia: distancia,
                        lat: stLat,
                        lon: stLon
                    };
                });

                // Ordena do mais próximo para o mais distante
                postosProximos.sort((a, b) => a.distancia - b.distancia);

                // Renderiza na interface
                renderizarListaPostos(postosProximos);
            }

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn("Timeout de 6s atingido na busca de postos.");
            } else {
                console.error("Erro ao carregar postos:", error.message);
            }
        }
    }, (geoError) => {
        console.error("Erro na Geolocalização:", geoError);
    });
}

function renderizarListaPostos(listaPostos) {
    const container = document.getElementById("lista-postos-container");
    if (!container) return;

    container.innerHTML = "";

    // Exibe os 5 postos mais próximos
    const topPostos = listaPostos.slice(0, 5);

    topPostos.forEach(posto => {
        const card = document.createElement("div");
        card.className = "station-card";

        const textoDistancia = posto.distancia < 1 
            ? `${Math.round(posto.distancia * 1000)}m` 
            : `${posto.distancia.toFixed(1)} km`;

        card.innerHTML = `
            <div class="station-info">
                <strong>${posto.nome}</strong>
                <small>📍 a ${textoDistancia} de você</small>
            </div>
        `;

        card.addEventListener("click", () => {
            document.querySelectorAll(".station-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            postoSelecionadoId = posto.id;
            console.log("Posto selecionado:", posto.nome, posto.id);
        });

        container.appendChild(card);
    });
}

// Inicializa a busca de postos ao carregar a aplicação
buscarPostosProximos();

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

        // Usa o posto selecionado pelo usuário ou o fallback/dummy
        const targetStationId = postoSelecionadoId || "2c89ee2e-af6e-4dc7-bb80-cde6a2ff5e82";

        publishButton.innerText = "SENDING...";
        publishButton.disabled = true;

        try {
            await reportPriceByName(targetStationId, numericPrice, selectedFuelType);
            console.log("Price successfully published in real-time!");
            
            // Recarrega os dados do banco para o usuário atual
            await carregarDadosDoBanco();

            // Reseta o formulário
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

// ==========================================================================
// 5. ESCUTA EM TEMPO REAL DO SUPABASE (REALTIME)
// ==========================================================================
supabaseClient
    .channel('reports-realtime-channel')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
            console.log('Novo preço registrado por outro usuário! Atualizando tela...', payload);
            carregarDadosDoBanco();
        }
    )
    .subscribe();