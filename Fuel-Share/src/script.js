const nomeUsuario = "Mateus"; 
document.getElementById("user-name").textContent = nomeUsuario; 

//-----------------------------------------------------
// Sistema de recepção dinmica
//-----------------------------------------------------

const horaAtual = new Date().getHours();
let saudacao = "";

if (horaAtual >= 5 && horaAtual < 12) {
    saudacao = "Bom dia";
} else if (horaAtual >= 12 && horaAtual < 18) {
    saudacao = "Boa tarde";
} else {
    saudacao = "Boa noite";
}

document.getElementById("greeting").textContent = saudacao;

//-----------------------------------------------------
// Cidade do Usuário
//-----------------------------------------------------
const cidadeUsuario = "Pouso Alegre"; 
document.getElementById("current-city").textContent = cidadeUsuario; 

//-----------------------------------------------------
// Lógica de Preço (Up/Down)
//-----------------------------------------------------
function updatePriceTrend(oldPrice, newPrice) {
    const trendElement = document.getElementById("price-trend-tool");
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

//-----------------------------------------------------
// Codigo que cuida do tempo de portagem do fuel hero
//-----------------------------------------------------

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

const dataDBlast = "2026-06-13T22:45:00"; //data teste

const elementoTempo = document.getElementById("lastUpdated");

if (elementoTempo) {
    elementoTempo.innerText = calcularTempoDecorrido(dataDBlast);
}
}

//-----------------------------------------------------
// 
//-----------------------------------------------------

// teste do código
updatePriceTrend(6.27, 6.39);