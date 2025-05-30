import { setLogged } from "./state.js";
import { loadProducts } from "./ui.js";

let products = []

export async function loginUser(email, password) {
  $.ajax({
    url: "api/auth.php/login",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      email: email,
      pass: password
    }),
    success: function(response) {
      if (response.success) {
        console.log(response);
        alert(response.message);
        setLogged(true);
        navigateTo("home");
      } else {
        alert("Email ou senha inválidos");
      }
    },
  })

}

export function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-password").value;

  loginUser(email, pass);
}

export async function getCategories(){
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "api/categories.php",
      type: "GET",
      dataType: "json",
      success: function(data) {
        resolve(data);
        console.log("Categorias carregadas:", data);
      },
      error: function(xhr, status, error) {
        console.error("Erro ao carregar categorias:", error);
        reject(error);
      }
    });
  });
}
  
export async function getProducts() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "api/produtos.php",
      type: "GET",
      dataType: "json",
      success: function(data) {
        products = data;
        resolve(products);
        console.log("Produtos carregados:", products);
      },
      error: function(xhr, status, error) {
        console.error("Erro ao carregar produtos:", error);
        reject(error);
      }
    });
  });
}


function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
}

export function confirmResgister(event){
  event.preventDefault();
  const code = document.getElementById("code-confirm").value;
  $.ajax({
    url: "api/auth.php/confirm",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      code: code
    }),
    success: function(response) {
      if (response.success) {
        alert(response.message);
        console.log(response);
        navigateTo("login");
      } else {
        alert("Erro ao confirmar registro. Tente novamente.");
      }
    },
  })
}

export function validatePasswords(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
      alert("As senhas não coincidem. Por favor, verifique."); 
      return;
  }
  $.ajax({
    url: "api/auth.php/register",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify ({
      name: document.getElementById("name-register").value,
      email: document.getElementById("email-register").value,
      pass: password
    }),
    success: function(response) {
      if (response.success) {
        alert(response.message);
        console.log(response);
        navigateTo("confirm-register")
      } else {
        alert("Erro ao cadastrar usuário. Tente novamente.");
      }
    },
    error: function(xhr, status, error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário. Tente novamente.");
    }
  })
}

export function getMyProducts() {
  $.ajax({
    url: "api/produtos.php/myproducts",
    type: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true },
    success: function(data) {
      console.log("Meus produtos carregados:", data);

      loadProducts(data, "myProductList");
    },
    error: function(xhr, status, error) {
      console.error("Erro ao carregar seus produtos:", error);
    }
  });
}

export async function getCategoryById(category_id){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `api/categories.php?id=${category_id}`,
            type: "GET",
            dataType: "json",
            success: function(data) {
                resolve(data);
                console.log("Categoria carregada:", data);
            },
            error: function(xhr, status, error) {
                console.error("Erro ao carregar categoria:", error);
                reject(error);
            }
        });
    })
}

export function checkLoginStatus() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "api/auth.php/status",
      type: "GET",
      dataType: "json",
      xhrFields: { withCredentials: true },
      success: function(response) {
        if (response.success && response.user) {
          setLogged(true);
          resolve(response.user);
          localStorage.setItem("userId", response.user.id);
        } else {
          setLogged(false);
          resolve(null);
        }
      },
      error: function(xhr, status, error) {
        setLogged(false);
        reject(error);
      }
    });
  });
}

export function createProduct(name, image, user_id, category_id){
    $.ajax({
        url: "api/produtos.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            name: name,
            image: image,
            user_id: user_id,
            category_id: category_id
        }),
        xhrFields: { withCredentials: true },
        success: function(response) {
            if (response.success) {
                console.log("Produto criado com sucesso:", response);
                alert("Produto criado com sucesso!");
                getMyProducts();
            } else {
                alert("Erro ao criar produto.");
            }
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.error("Erro ao criar produto:", error);
            alert("Erro ao criar produto.");
        }
    });
}

export function deleteProduct(productId) {
    $.ajax({
        url: `api/produtos.php`,
        type: "DELETE",
        dataType: "json",
        data: { id: productId },
        xhrFields: { withCredentials: true },
        success: function(response) {
        if (response.success) {
            console.log("Produto deletado com sucesso:", response);
            alert("Produto deletado com sucesso!");
            getMyProducts();
        } else {
            alert("Erro ao deletar produto.");
        }
        },
        error: function(xhr, status, error) {
        console.error("Erro ao deletar produto:", error);
        alert("Erro ao deletar produto.");
        }
    });
}

export function logout(){
    $.ajax({
        url: "api/auth.php/logout",
        type: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        success: function(response) {
            if (response.success) {
                console.log("Usuário deslogado com sucesso:", response);
                setLogged(false);
                localStorage.removeItem("userId");
                navigateTo("home");
            } else {
                alert("Erro ao deslogar usuário.");
                console.error("Erro ao deslogar usuário:", response);
            }
        },
        error: function(xhr, status, error) {
            console.error("Erro ao deslogar usuário:", error);
            alert("Erro ao deslogar usuário.");
        }
    });
}


export function switchRequest(productId){
    $.ajax({
        url: "api/requests.php",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        xhrFields: { withCredentials: true },
        data: JSON.stringify({
            product_id: productId
        }),
        success: function(response) {
            if (response.success) {
                console.log("Requisição switch bem sucedida:", response);
                alert("Requisição switch bem sucedida!");
                navigateTo("home");
            } else {
                alert("Erro ao realizar requisição switch.");
            }
            console.log(response)
        },
        
        error: function(xhr, status, error) {
            console.error("Erro ao realizar requisição switch:", error);
            alert("Erro ao realizar requisição switch.");
        }
    })
}

export async function hasRequested(productId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `api/requests.php?product_id=${productId}`,
        type: "GET",
        dataType: "json",
        xhrFields: { withCredentials: true },
        success: function(data) {
          resolve(data.requested);
        },
        error: function() {
          resolve(false);
        }
      });
    });
  }


  export async function getNotifications() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "api/notifications.php",
        type: "GET",
        dataType: "json",
        xhrFields: { withCredentials: true },
        success: resolve,
        error: reject
      });
    });
  }
  
