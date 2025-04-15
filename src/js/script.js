let products = []

const base_url = './src/data/fakeDatabase.json';


const state = {
  logged: false
}

function setLogged(value){ 
    state.logged = value;
    renderUI();
}

function isLogged(){
  return state.logged;
}

async function loginUser(email, password) {
    const response = await axios.get(base_url);
    const users = response.data.users;
    const user = users.find(user => user.email === email && user.pass === password);
    if(user) {
        alert("Bem vindo");
        setLogged(true);
        navigateTo("home");
    }
    else {
        alert("Email ou senha inválidos");
    }
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  loginUser(email, password);
}
  
async function getProducts() {
  const response = await axios.get(base_url);
  products = response.data.products;
  console.log(products);
  return products;
}

async function navigateTo(page) {
  try {
    const response = await fetch(`pages/${page}.html`);
    const html = await response.text();
    document.getElementById("content").innerHTML = html;
  
    if (page === "home") {
      const products = await getProducts(); 
      loadProducts(products); 
    }
  } catch (error) {
    document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
    console.error("Erro ao carregar a página:", error);
  }
  
  window.history.pushState({}, "", `/${page}`);
}


function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
}

function validatePasswords(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
      alert("As senhas não coincidem. Por favor, verifique."); 
      return false;
  }
  alert("Cadastro realizado com sucesso!");
  navigateTo("login")

  return true; 
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

  productList.innerHTML = null;

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

function renderUI() {
  const logged = isLogged();

  document.getElementById('login-buttons').style.display = logged ? 'none' : 'block';
  document.getElementById('logout').style.display = logged ? 'block' : 'none';
}

$(document).ready(() => {
  renderUI();
  navigateTo("home");
  loadFooter();

  $(document).on("input", ".search-input", function() {
    searchProducts();
  });
});