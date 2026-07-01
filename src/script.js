if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    if (confirm("Nova versão disponível. Deseja atualizar?")) {
                        window.location.reload();
                    }
                }
            });
        });
    })
    .catch(err => console.log('Erro ao registar SW:', err));
}

//-----------------------------------------------------
// Sistema de recepção dinâmica
//-----------------------------------------------------
const nomeUsuario = "Mateus"; 
document.getElementById("user-name").textContent = nomeUsuario; 

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
// Lógica de Preço (Up/Down) - CHAVE CORRIGIDA AQUI
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
} // <-- ESSA PORCARIA AQUII OHHHH FEZ EU GAASTAR
//  2 HORAS E REFAZER O SITE 6 VEZES E NÃO RESOLVIA O PROLEMA

//-----------------------------------------------------
// Codigo que cuida do tempo de postagem do fuel hero  
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

// Data teste e execução do cálculo de tempo
const dataDBlast = "2026-06-13T22:45:00"; // Mantido em 2026 conforme seu padrão
const elementoTempo = document.getElementById("lastUpdated");

if (elementoTempo) {
    elementoTempo.innerText = calcularTempoDecorrido(dataDBlast);
}

// Teste das funções de preço
updatePriceTrend(6.27, 6.39);


// ==========================================================================
// 📱 SISTEMA DE NAVEGAÇÃO (TROCA DE PÁGINAS)
// ==========================================================================

const botaoHome = document.querySelector('.act1');
const botaoValor = document.querySelector('.act2');
const botaoMapa = document.querySelector('.act3');
const botaoPerfil = document.querySelector('.profile-menu')

botaoHome.addEventListener('click', () => trocarPagina('page-home'));
botaoValor.addEventListener('click', () => trocarPagina('page-valor'));
botaoMapa.addEventListener('click', () => trocarPagina('page-mapa'));
botaoPerfil.addEventListener('click', () => trocarPagina('page-perfil'))

function trocarPagina(idDaPaginaAlvo) {
    const todasAsPaginas = document.querySelectorAll('.page');
    todasAsPaginas.forEach(pagina => {
        pagina.classList.remove('active');
    });

    const paginaAlvo = document.getElementById(idDaPaginaAlvo);
    if (paginaAlvo) {
        paginaAlvo.classList.add('active');
    }

 
    const todosOsBotoes = document.querySelectorAll('.nav-bottom button');
    todosOsBotoes.forEach(botao => {
        botao.removeAttribute('active'); // Tira o visual ativo dos outros
    });
    
    if (idDaPaginaAlvo === 'page-home') botaoHome.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-valor') botaoValor.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-mapa') botaoMapa.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-perfil') botaoPerfil.setAttribute('active', '');
}


// ==========================================================================
// ⌨️ NAVEGAÇÃO POR TECLADO (SETAS ESQUERDA E DIREITA) - VERSÃO ADAPTADA
// ==========================================================================

const ordemPaginas = ['page-home', 'page-valor', 'page-mapa'];

window.addEventListener('keydown', (event) => {
    const paginaAtivaAtual = document.querySelector('.page.active');
    if (!paginaAtivaAtual) return;

    const idAtual = paginaAtivaAtual.id;
    
    let indiceAtual = ordemPaginas.indexOf(idAtual);

    if (event.key === 'ArrowRight') {
        let proximoIndice = (indiceAtual + 1) % ordemPaginas.length;
        trocarPagina(ordemPaginas[proximoIndice]);
    } 
    else if (event.key === 'ArrowLeft') {
        let indiceAnterior = (indiceAtual - 1 + ordemPaginas.length) % ordemPaginas.length;
        trocarPagina(ordemPaginas[indiceAnterior]);
    }
});

let newWorker;

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js')
    .then(reg => {
        reg.addEventListener('updatefound', () => {
            newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log("Nova versão disponível! Use forceUpdate() para atualizar.");
                }
            });
        });
    })
    .catch(err => console.error("Erro no Service Worker:", err));
}

window.forceUpdate = function() {
    if (!newWorker) {
        console.log("Nenhuma atualização pendente encontrada.");
        window.location.reload();
        return;
    }
    newWorker.postMessage({ action: 'skipWaiting' });
    window.location.reload();
};