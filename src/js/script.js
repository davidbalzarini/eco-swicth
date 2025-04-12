
  // Exemplo de array de produtos
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
  const term = $(".search-input").val().toLowerCase();
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

function loadProducts(list = products){
  const productList = $("#productList");

  list.map(item => {
    const productDiv = $("<div>").addClass("product");
    const productImg = $("<img>").attr("src", item.image).attr("alt", item.name).addClass("product-image");
    const productName = $("<p>").text(item.name);
    const swapButton = $("<button>").text("Solicitar troca").addClass("product")

    productDiv.append(productImg, productName, swapButton);
    productList.append(productDiv);
  })
}

$(document).ready(() => {
  navigateTo("home");
  loadFooter();

  $(document).on("input", ".search-input", function() {
    searchProducts();
  });
});