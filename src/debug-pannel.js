let tapCount = 0;
let tapTimer = null;

// Envolvemos tudo em um evento que espera o HTML carregar 100%
document.addEventListener("DOMContentLoaded", () => {
    const versionLabel = document.getElementById("version-label");
    
    // Se você não tiver um elemento com id="version-label" no HTML, o JS não vai quebrar!
    if (!versionLabel) {
        console.warn("⚠️ Elemento #version-label não foi encontrado no HTML. O painel de debug não vai ativar.");
        return;
    }

    const debugPanel = document.createElement("div");
    debugPanel.style.position = "fixed";
    debugPanel.style.bottom = "10px";
    debugPanel.style.left = "10px";
    debugPanel.style.background = "black";
    debugPanel.style.color = "lime";
    debugPanel.style.padding = "10px";
    debugPanel.style.fontSize = "12px";
    debugPanel.style.display = "none";
    debugPanel.style.zIndex = "9999";
    debugPanel.innerText = "DEBUG MODE ACTIVE";
    document.body.appendChild(debugPanel);

    // Adiciona o evento de cliques seguidos
    versionLabel.addEventListener("click", () => {
        tapCount++;
        clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
            tapCount = 0;
        }, 600);

        if (tapCount === 3) {
            tapCount = 0;
            const enabled = debugPanel.style.display === "none";
            debugPanel.style.display = enabled ? "block" : "none";
            console.log("🕵️‍♂️ Debug mode:", enabled ? "ON" : "OFF");
        }
    });
});

// O código antigo do "stationList" que estava solto e quebrando foi removido daqui,
// já que você comentou que vai trabalhar nele mais tarde (workonlatter) dentro do fuel-manager.js!