import { createProduct, deleteProduct, getCategories, getCategoryById, getNotifications, getProducts, hasRequested, switchRequest } from "./api.js";
import { navigateTo } from "./router.js";
import { isLogged } from "./state.js";

let products = getProducts();


function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
}


export async function searchProducts() {
    const term = document.querySelector(".search-input").value.toLowerCase();
    const products = await getProducts(); 
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(term));
    loadProducts(filteredProducts);
  }

export function loadFooter() {
  fetch("pages/footer.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("footer-container").innerHTML = html;
    });
}

export function loadCategories(categories) {
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  categories.forEach(category => {
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category");
    categoryDiv.textContent = category.descricao;
    categoryList.appendChild(categoryDiv);
  });
}

export async function loadProducts(list = products, idList = "productList") {

  if(idList === "myProductList" && !isLogged()){
    alert("Você precisa estar logado para ver seus produtos.");
    navigateTo("login");
    return;
  }
  
  const productList = document.getElementById(idList);
  productList.innerHTML = "";
  if (idList === "myProductList" && !document.getElementById("buttonContainer")) {
    const divButton = $('<div>')
    divButton.attr('id', 'buttonContainer');
    divButton.addClass("button-container");
    const criarBtn = $('<button>');
    criarBtn.attr('id', 'criarAnuncio')
    criarBtn.text("Criar anúncio");
    criarBtn.addClass("product-button");
    criarBtn.click(() => {
      abrirModal();
    });
    divButton.append(criarBtn);

    $("#myProductList").before(divButton);
  }
  if(list.length === 0){
    productList.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }
  

  for (const item of list) {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    const productImg = document.createElement("img");
    productImg.src = item.image;
    productImg.alt = item.name;
    productImg.classList.add("product-image");

    const productName = document.createElement("p");
    productName.textContent = item.name;

    if (item.user_id === localStorage.getItem("userId")) {
      const updateButton = document.createElement("button");
      updateButton.textContent = "Alterar produto";
      updateButton.classList.add("product-button");

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Deletar produto";
      deleteButton.classList.add("product-button");
      deleteButton.onclick = () => deleteProduct(item.id);

      productDiv.append(productImg, productName, updateButton, deleteButton);
      productList.appendChild(productDiv);
    } else {
        const requested = await hasRequested(item.id);
        const swapButton = document.createElement("button");
        swapButton.classList.add("product-button");
        if (requested) {
        swapButton.textContent = "Já solicitado";
        swapButton.disabled = true;
        } else {
        swapButton.textContent = "Solicitar troca";
        swapButton.onclick = () => switchRequest(item.id);
        }
      productDiv.append(productImg, productName, swapButton);
      productList.appendChild(productDiv);

    }

    try {
      const category = await getCategoryById(item.category_id);
      const categoryDiv = document.createElement("p");
      categoryDiv.classList.add("product-category");
      categoryDiv.textContent = category && category.descricao ? category.descricao : "Categoria não encontrada";
      productDiv.appendChild(categoryDiv);
    } catch (e) {
      const categoryDiv = document.createElement("p");
      categoryDiv.classList.add("product-category");
      categoryDiv.textContent = "Categoria não encontrada";
      productDiv.appendChild(categoryDiv);
    }
  }
}

export function renderUI() {
  const logged = isLogged();

  document.getElementById('login-buttons').style.display = logged ? 'none' : 'block';
  document.getElementById('logout').style.display = logged ? 'block' : 'none';
}

export function abrirModal() {
    const modal = document.getElementById("modal-bg");
    if (modal) modal.style.display = "flex";
  }
  
  export function fecharModal() {
    const modal = document.getElementById("modal-bg");
    if (modal) modal.style.display = "none";
  }

  export async function initModalEvents() {
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.onclick = fecharModal;
  
    const cancelBtn = document.getElementById("cancelar-modal");
    if (cancelBtn) cancelBtn.onclick = fecharModal;

    const categories = await getCategories();
    categories.forEach(cat => {
        const option = $('<option>');
        option.attr('value', cat.id);
        option.text(cat.descricao);
        $("#categoria-produto").append(option);
    })
  
    const form = document.getElementById("form-anuncio");
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        const nome = document.getElementById("nome-produto").value;
        const imagem = document.getElementById("imagem-produto").value;
        const categoria = document.getElementById("categoria-produto").value;
        const userId = localStorage.getItem("userId");
        console.log("User ID:", userId);
        console.log("Nome:", nome);
        console.log("Imagem:", imagem);
        console.log("Categoria:", categoria);
        createProduct(nome, imagem, userId, categoria);
        fecharModal();

      };
    }
  }


  export async function renderNotifications() {
    const notifications = await getNotifications();
    const container = document.getElementById("notificationsList");
    container.innerHTML = "";
    if (notifications.length === 0) {
      container.innerHTML = "<p>Sem notificações.</p>";
      return;
    }
    notifications.forEach(n => {
      const div = document.createElement("div");
      div.className = "notification";
      div.innerHTML = `
        <strong>${n.requester_name}</strong> solicitou troca do produto <strong>${n.product_name}</strong> em ${new Date(n.created_at).toLocaleString()}
        <span>Status: ${n.status}</span>
      `;
      container.appendChild(div);
    });
  }