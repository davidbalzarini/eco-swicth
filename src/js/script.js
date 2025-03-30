function toggleMenu() {
    document.querySelector('.navbar').classList.toggle('active');
}

function navigateTo(page) {
    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
        })
        .catch(() => {
            document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
        });
    window.history.pushState({}, "", `/${page}`);
}

function loadFooter() {
    fetch("pages/footer.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("footer-container").innerHTML = html;
        })
        .catch(error => console.error("Erro ao carregar o footer:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    navigateTo("home"); // Carrega a página inicial
    loadFooter(); // Carrega o footer
});
document.addEventListener("DOMContentLoaded", () => {
    navigateTo("home")
    loadFooter()
});
