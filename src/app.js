import { supabaseClient } from './js/database.js';
import { loginUser, logoutUser, getCurrentUser } from './js/auth.js';
import { carregarDadosDoBanco } from './js/fuel-manager.js';

// ==========================================================================
// SISTEMA DE NAVEGAÇÃO (TROCA DE PÁGINAS)
// ==========================================================================

const botaoHome = document.querySelector('.act1');
const botaoValor = document.querySelector('.act2');
const botaoMapa = document.querySelector('.act3');
const botaoPerfil = document.querySelector('.profile-menu-button');

if (botaoHome) botaoHome.addEventListener('click', () => trocarPagina('page-home'));
if (botaoValor) botaoValor.addEventListener('click', () => trocarPagina('page-valor'));
if (botaoMapa) botaoMapa.addEventListener('click', () => trocarPagina('page-mapa'));
if (botaoPerfil) botaoPerfil.addEventListener('click', () => trocarPagina('page-perfil'));

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
        botao.removeAttribute('active');
    });
    
    if (botaoPerfil) {
        botaoPerfil.removeAttribute('active');
    }
    
    if (idDaPaginaAlvo === 'page-home' && botaoHome) botaoHome.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-valor' && botaoValor) botaoValor.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-mapa' && botaoMapa) botaoMapa.setAttribute('active', '');
    if (idDaPaginaAlvo === 'page-perfil' && botaoPerfil) botaoPerfil.setAttribute('active', '');
}

// ==========================================================================
// NAVEGAÇÃO POR TECLADO
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

// ==========================================================================
// LÓGICA DE PREÇO & TEMPO
// ==========================================================================
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
// INICIALIZAÇÃO DO DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
    const nomeUsuario = "Mateus"; 
    const nameElement = document.getElementById("user-name");
    if (nameElement) nameElement.textContent = nomeUsuario; 

    const horaAtual = new Date().getHours();
    let saudacao = (horaAtual >= 5 && horaAtual < 12) ? "Bom dia" : (horaAtual >= 12 && horaAtual < 18) ? "Boa tarde" : "Boa noite";
    
    const greetingElement = document.getElementById("greeting");
    if (greetingElement) greetingElement.textContent = saudacao;

    const cityElement = document.getElementById("current-city");
    if (cityElement) cityElement.textContent = "Pouso Alegre"; 

    // BUSCA OS DADOS DO SUPABASE
    await carregarDadosDoBanco();

    // LOGIN & SESSÃO
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
                updateAuthUI(user);
            } catch (error) {
                console.log("Erro ao entrar: " + error.message);
            } finally {
                if (btnText) btnText.innerText = "ENTRAR";
            }
        });
    }

    try {
        const user = await getCurrentUser();
        updateAuthUI(user);
    } catch (e) {
        console.log("Nenhum usuário logado inicialmente.");
    }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        updateAuthUI(session.user);
    } else {
        updateAuthUI(null);
    }
}); 