import { supabaseClient } from './js/database.js';
import { loginUser, logoutUser, getCurrentUser } from './js/auth.js';

// ==========================================================================
// SISTEMA DE NAVEGAÇÃO (TROCA DE PÁGINAS)
// ==========================================================================

const botaoHome = document.querySelector('.act1');
const botaoValor = document.querySelector('.act2');
const botaoMapa = document.querySelector('.act3');
const botaoPerfil = document.querySelector('.profile-menu');


botaoHome.addEventListener('click', () => trocarPagina('page-home'));
botaoValor.addEventListener('click', () => trocarPagina('page-valor'));
botaoMapa.addEventListener('click', () => trocarPagina('page-mapa'));
botaoPerfil.addEventListener('click', () => trocarPagina('page-perfil'));

function trocarPagina(idDaPaginaAlvo) {
    const todasAsPaginas = document.querySelectorAll('.page');
    todasAsPaginas.forEach(pagina => {
        pagina.classList.remove('active');
    });

    const paginaAlvo = document.getElementById(idDaPaginaAlvo);
    if (paginaAlvo) {
        paginaAlvo.classList.add('active');
    }

    // Remove o active dos botões da barra inferior
    const todosOsBotoes = document.querySelectorAll('.nav-bottom button');
    todosOsBotoes.forEach(botao => {
        botao.removeAttribute('active'); //  Un activates the other menus 
    });
    
    // REMOVE O ACTIVE DO BOTÃO DE PERFIL TAMBÉM (Que está lá no Header)
    if (botaoPerfil) {
        botaoPerfil.removeAttribute('active');
    }
    
    if (idDaPaginaAlvo === 'page-home') botaoHome.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-valor') botaoValor.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-mapa') botaoMapa.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-perfil') botaoPerfil.setAttribute('active', '');
}


// ==========================================================================
// ⌨️ NAVEGAÇÃO POR TECLADO (SETAS ESQUERDA E DIREITA) - VERSÃO ADAPTADA
// ==========================================================================

const ordemPaginas = ['page-home', 'page-valor', 'page-mapa', 'page-perfil'];

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

// ==========================================================================
// SERVICE WORKER
// ==========================================================================
let newWorker;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => {
        reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            newWorker = worker;
            worker.addEventListener('statechange', () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                    if (confirm("Nova versão disponível. Deseja atualizar?")) {
                        window.location.reload();
                    }
                }
            });
        });
    })
    .catch(err => console.log('Erro ao registar SW:', err));
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

//-----------------------------------------------------
// Lógica de Preço (Up/Down) - 
//-----------------------------------------------------
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

// ==========================================================================
// CONTROLE INTERACTIVE DE AUTENTICAÇÃO (SUPABASE)
// ==========================================================================
function updateAuthUI(user) {
    const loginContainer = document.getElementById('login-container');
    const profileLoggedContainer = document.getElementById('profile-logged-container');
    const userDisplayName = document.getElementById('user-display-name');

    if (!loginContainer || !profileLoggedContainer) return;
    
    if (user) {
        loginContainer.style.display = 'none';
        profileLoggedContainer.style.display = 'block';
        if (userDisplayName) {
            userDisplayName.innerText = user.email.split('@')[0];
        }
    } else {
        loginContainer.style.display = 'block';
        profileLoggedContainer.style.display = 'none';
    }
}

// ==========================================================================
// 🏁 INICIALIZAÇÃO DO DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Sistema de recepção dinâmica
    const nomeUsuario = "Mateus"; 
    const nameElement = document.getElementById("user-name");
    if (nameElement) nameElement.textContent = nomeUsuario; 

    const horaAtual = new Date().getHours();
    let saudacao = "";

    if (horaAtual >= 5 && horaAtual < 12) {
        saudacao = "Bom dia";
    } else if (horaAtual >= 12 && horaAtual < 18) {
        saudacao = "Boa tarde";
    } else {
        saudacao = "Boa noite";
    }

    const greetingElement = document.getElementById("greeting");
    if (greetingElement) greetingElement.textContent = saudacao;

    // 2. Cidade do Usuário
    const cidadeUsuario = "Pouso Alegre"; 
    const cityElement = document.getElementById("current-city");
    if (cityElement) cityElement.textContent = cidadeUsuario; 

    // 3. Execução dos cálculos de tempo e tendências
    const dataDBlast = "2026-07-01T22:45:00"; 
    const elementoTempo = document.getElementById("lastUpdated");
    if (elementoTempo) {
        elementoTempo.innerText = calcularTempoDecorrido(dataDBlast);
    }

    try {
        updatePriceTrend(6.29, 6.49);
    } catch (e) {
        console.warn("Elemento de tendência não encontrado na view atual.");
    }

    // 5. Gatilho do Botão de Login
    const btnLoginTrigger = document.getElementById('btn-login-trigger');
    if (btnLoginTrigger) {
        btnLoginTrigger.addEventListener('click', async () => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const btnText = document.getElementById('btn-login-text');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert("Por favor, preencha o e-mail e a senha.");
                return;
            }

            try {
                if (btnText) btnText.innerText = "CONECTANDO...";
                const user = await loginUser(email, password);
                console.log("Logado com sucesso!");
                updateAuthUI(user);
            } catch (error) {
                console.log("Erro ao entrar: " + error.message);
            } finally {
                if (btnText) btnText.innerText = "ENTRAR";
            }
        });
    }

    // 6. Verifica se o usuário já possui sessão salva no Supabase (Sem travar nada se não tiver)
    try {
        const user = await getCurrentUser();
        updateAuthUI(user);
    } catch (e) {
        console.log("Nenhum usuário logado inicialmente.");
    }
});


// Monitoramento em tempo real do status de login
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        updateAuthUI(session.user);
    } else {
        updateAuthUI(null);
    }
});