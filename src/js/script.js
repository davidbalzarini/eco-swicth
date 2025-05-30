// let products = []

// const base_url = './src/data/fakeDatabase.json';




// async function loginUser(email, password) {
//   $.ajax({
//     url: "api/auth.php/login",
//     type: "POST",
//     dataType: "json",
//     contentType: "application/json",
//     data: JSON.stringify({
//       email: email,
//       pass: password
//     }),
//     success: function(response) {
//       if (response.success) {
//         console.log(response);
//         alert(response.message);
//         setLogged(true);
//         navigateTo("home");
//       } else {
//         alert("Email ou senha inválidos");
//       }
//     },
//   })

// }

// function handleLogin(event) {
//   event.preventDefault();

//   const email = document.getElementById("login-email").value;
//   const pass = document.getElementById("login-password").value;

//   loginUser(email, pass);
// }

// export async function getCategories(){
//   return new Promise((resolve, reject) => {
//     $.ajax({
//       url: "api/categories.php",
//       type: "GET",
//       dataType: "json",
//       success: function(data) {
//         resolve(data);
//         console.log("Categorias carregadas:", data);
//       },
//       error: function(xhr, status, error) {
//         console.error("Erro ao carregar categorias:", error);
//         reject(error);
//       }
//     });
//   });
// }
  
// export async function getProducts() {
//   return new Promise((resolve, reject) => {
//     $.ajax({
//       url: "api/produtos.php",
//       type: "GET",
//       dataType: "json",
//       success: function(data) {
//         products = data;
//         resolve(products);
//         console.log("Produtos carregados:", products);
//       },
//       error: function(xhr, status, error) {
//         console.error("Erro ao carregar produtos:", error);
//         reject(error);
//       }
//     });
//   });
// }

// // export async function navigateTo(page) {
// //   try {
// //     const response = await fetch(`pages/${page}.html`);
// //     const html = await response.text();
// //     document.getElementById("content").innerHTML = html;
  
// //     if (page === "home") {
// //       const products = await getProducts(); 
// //       const categories = await getCategories();
// //       loadProducts(products); 
// //       loadCategories(categories);
// //     }
// //     if( page === "products") {
// //       getMyProducts();
// //     }
// //   } catch (error) {
// //     document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
// //     console.error("Erro ao carregar a página:", error);
// //   }
  
// //   window.history.pushState({}, "", `/${page}`);
// // }


// function toggleMenu() {
//   document.querySelector(".navbar").classList.toggle("active");
// }

// function confirmResgister(event){
//   event.preventDefault();
//   const code = document.getElementById("code-confirm").value;
//   $.ajax({
//     url: "api/auth.php/confirm",
//     type: "POST",
//     dataType: "json",
//     contentType: "application/json",
//     data: JSON.stringify({
//       code: code
//     }),
//     success: function(response) {
//       if (response.success) {
//         alert(response.message);
//         console.log(response);
//         navigateTo("home");
//       } else {
//         alert("Erro ao confirmar registro. Tente novamente.");
//       }
//     },
//   })
// }

// function validatePasswords(event) {
//   event.preventDefault();
//   const password = document.getElementById("password").value;
//   const confirmPassword = document.getElementById("confirm-password").value;

//   if (password !== confirmPassword) {
//       alert("As senhas não coincidem. Por favor, verifique."); 
//       return;
//   }
//   $.ajax({
//     url: "api/auth.php/register",
//     type: "POST",
//     dataType: "json",
//     contentType: "application/json",
//     data: JSON.stringify ({
//       name: document.getElementById("name-register").value,
//       email: document.getElementById("email-register").value,
//       pass: password
//     }),
//     success: function(response) {
//       if (response.success) {
//         alert(response.message);
//         console.log(response);
//         navigateTo("confirm-register")
//       } else {
//         alert("Erro ao cadastrar usuário. Tente novamente.");
//       }
//     },
//     error: function(xhr, status, error) {
//       console.error("Erro ao cadastrar usuário:", error);
//       alert("Erro ao cadastrar usuário. Tente novamente.");
//     }
//   })
// }


// export function searchProducts() {
//   const term = document.querySelector(".search-input").value.toLowerCase();
//   const filteredProducts = products.filter(product => product.name.toLowerCase().includes(term));
//   loadProducts(filteredProducts);
// }

// export function loadFooter() {
//   fetch("pages/footer.html")
//     .then(response => response.text())
//     .then(html => {
//       document.getElementById("footer-container").innerHTML = html;
//     });
// }

// export function loadCategories(categories) {
//   const categoryList = document.getElementById("categoryList");
//   categoryList.innerHTML = "";

//   categories.forEach(category => {
//     const categoryDiv = document.createElement("div");
//     categoryDiv.classList.add("category");
//     categoryDiv.textContent = category.descricao;
//     // Adicione eventos se quiser
//     categoryList.appendChild(categoryDiv);
//   });
// }

// export function getMyProducts() {
//   $.ajax({
//     url: "api/produtos.php/myproducts",
//     type: "GET",
//     dataType: "json",
//     xhrFields: { withCredentials: true },
//     success: function(data) {
//       console.log("Meus produtos carregados:", data);
//       loadProducts(data, "myProductList");
//     },
//     error: function(xhr, status, error) {
//       console.error("Erro ao carregar seus produtos:", error);
//       // Opcional: mostrar mensagem para o usuário
//     }
//   });
// }

// export function checkLoginStatus() {
//   return new Promise((resolve, reject) => {
//     $.ajax({
//       url: "api/auth.php/status",
//       type: "GET",
//       dataType: "json",
//       xhrFields: { withCredentials: true },
//       success: function(response) {
//         if (response.success && response.user) {
//           setLogged(true);
//           resolve(response.user);
//           localStorage.setItem("userId", response.user.id);
//         } else {
//           setLogged(false);
//           resolve(null);
//         }
//       },
//       error: function(xhr, status, error) {
//         setLogged(false);
//         reject(error);
//       }
//     });
//   });
// }

// export function loadProducts(list = products, idList = "productList") {
//   const productList = document.getElementById(idList);

//   productList.innerHTML = "";

//   list.forEach(item => {
//     const productDiv = document.createElement("div");
//     productDiv.classList.add("product");

//     const productImg = document.createElement("img");
//     productImg.src = item.image;
//     productImg.alt = item.name;
//     productImg.classList.add("product-image");

//     const productName = document.createElement("p");
//     productName.textContent = item.name;
//     if(item.user_id === localStorage.getItem("userId")){
//       const updateButton = document.createElement("button");
//       updateButton.textContent = "Alterar produto";
//       updateButton.classList.add("product-button");
//       const deleteButton = document.createElement("button");
//       deleteButton.textContent = "Deletar produto";
//       deleteButton.classList.add("product-button");
//       deleteButton.onclick = function() {
//         $.ajax({
//           url: `api/produtos.php`,
//           type: "DELETE",
//           dataType: "json",
//           data: {id: item.id},
//           xhrFields: { withCredentials: true },
//           success: function(response) {
//             if (response.success) {
//               console.log("Produto deletado com sucesso:", response);
//               console.log(item.id);
//               alert("Produto deletado com sucesso!");
//               getMyProducts();
//             } else {
//               alert("Erro ao deletar produto.");
//             }
//           },
//           error: function(xhr, status, error) {
//             console.error("Erro ao deletar produto:", error);
//             alert("Erro ao deletar produto.");
//           }
//         });
//       };
//       productDiv.append(productImg, productName, updateButton, deleteButton);
//       productList.appendChild(productDiv);

//     }
//     else{
//       const swapButton = document.createElement("button");
//       swapButton.textContent = "Solicitar troca";
//       swapButton.classList.add("product-button");
//       productDiv.append(productImg, productName, swapButton);
//       productList.appendChild(productDiv);
//     }
//   });
// }

// export function renderUI() {
//   const logged = isLogged();

//   document.getElementById('login-buttons').style.display = logged ? 'none' : 'block';
//   document.getElementById('logout').style.display = logged ? 'block' : 'none';
// }

// // $(document).ready(() => {
// //   checkLoginStatus();
// //   renderUI();
// //   navigateTo("home");
// //   loadFooter();

// //   $(document).on("input", ".search-input", function() {
// //     searchProducts();
// //   });
// // });