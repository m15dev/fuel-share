const nomeUsuario = "Mateus"; // Nome do usuário, mateus por enquanto

document.getElementById("user-name").textContent = nomeUsuario; //altera o texto 

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
document.getElementById("saudacao").textContent = saudacao;


//-----------------------------------------------------

const cidadeUsuario = "Pouso Alegre"; // Cidade do usuário, Pouso Alegre por enquanto
document.getElementById("cidade").textContent = cidadeUsuario; //altera o texto