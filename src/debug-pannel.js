let tapCount = 0;
let tapTimer = null;

const versionLabel = document.getElementById("version-label");
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

        console.log("Debug mode:", enabled ? "ON" : "OFF");
    }
});