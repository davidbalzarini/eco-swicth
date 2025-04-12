const products = [
  { name: "Cadeira de madeira", image: "../public/media/item.png" },
  { name: "Mesa de escritório", image: "https://toribio.com.br/controle/arquivo/p12a-br.jpg" },
  { name: "S9 quebrado", image: "https://th.bing.com/th/id/OIP.e6ER8nfBUcDmVH4TUpfxIAHaFj?rs=1&pid=ImgDetMain" },
  { name: "Cadeira de madeira", image: "../public/media/item.png" },
  { name: "Mesa de escritório", image: "https://toribio.com.br/controle/arquivo/p12a-br.jpg" },
  { name: "S9 quebrado", image: "https://th.bing.com/th/id/OIP.e6ER8nfBUcDmVH4TUpfxIAHaFj?rs=1&pid=ImgDetMain" },
];

function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
}

function navigateTo(page) {
  fetch(`pages/${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById("content").innerHTML = html;
      if (page === "home") {
        loadProducts();
      }
    })
    .catch(() => {
      document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
    });
  window.history.pushState({}, "", `/${page}`);
}

function searchProducts() {
  const term = document.querySelector(".search-input").value.toLowerCase();
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(term));
  loadProducts(filteredProducts);
}

function loadFooter() {
  fetch("pages/footer.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("footer-container").innerHTML = html;
    });
}

function loadProducts(list = products) {
  const productList = document.getElementById("productList");

  if (!productList) {
    console.error("Elemento #productList não encontrado.");
    return;
  }

  productList.innerHTML = "";

  list.forEach(item => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    const productImg = document.createElement("img");
    productImg.src = item.image;
    productImg.alt = item.name;
    productImg.classList.add("product-image");

    const productName = document.createElement("p");
    productName.textContent = item.name;

    const swapButton = document.createElement("button");
    swapButton.textContent = "Solicitar troca";
    swapButton.classList.add("product-button");

    productDiv.append(productImg, productName, swapButton);
    productList.appendChild(productDiv);
  });
}

$(document).ready(() => {
  navigateTo("home");
  loadFooter();

  $(document).on("input", ".search-input", function() {
    searchProducts();
  });
});