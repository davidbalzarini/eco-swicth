import { setLogged } from "./state.js";
import { closeChat, loadProducts, loadUserConversations, openChat, renderHomeWithPagination } from "./ui.js";

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
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userEmail", response.user.email);
        
        console.log(response);
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userEmail", response.user.email);
      
        setLogged(true);
        navigateTo("home");
        
      } else {
        alert("Credenciais inválidas!");
        //showToast("Erro", "Credenciais inválidas!");
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

export async function getProductsPaginated(page = 1, limit = 12) {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `api/produtos.php?limit=${limit}&offset=${offset}`,
      type: "GET",
      dataType: "json",
      success: resolve,
      error: reject
    });
  });
}

export async function getProductById(productId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `api/produtos.php?id=${productId}`, 
      type: "GET",
      dataType: "json",
      success: function(data) {
        resolve(data);
        console.log("Produto carregado:", data);
      },
      error: function(xhr, status, error) {
        console.error("Erro ao carregar produto:", error);
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
        //showToast("Sucesso", response.message);
        console.log(response);
        navigateTo("login");
      } else {
        alert("Erro ao confirmar registro. Tente novamente.");
        //showToast("Erro", "Erro ao confirmar registro. Tente novamente.");
      }
    },
  })
}

export function validatePasswords(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // if (password !== confirmPassword) {
  //     alert("As senhas não coincidem. Por favor, verifique."); 
  //     return;
  // }
  $.ajax({
    url: "api/auth.php/register",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify ({
      name: document.getElementById("name-register").value,
      email: document.getElementById("email-register").value,
      pass: password,
      repeat_pass: confirmPassword
    }),
    success: function(response) {
      if (response.success) {
        alert(response.message);
        //showToast("Sucesso", response.message);
        console.log(response);
        navigateTo("confirm-register")
      } else {
        alert(response.message);
        //showToast("Erro", "Erro ao cadastrar usuário. Tente novamente.");
      }
    },
    error: function(xhr, status, error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário. Tente novamente.");
      //showToast("Erro", "Erro ao cadastrar usuário. Tente novamente.");
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

export async function batchCheckRequests(productIds) {
  if (!productIds.length) return {};
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `api/requests.php?batch_check=1`,
      type: "POST",
      data: JSON.stringify({ product_ids: productIds }),
      contentType: "application/json",
      dataType: "json",
      xhrFields: { withCredentials: true },
      success: function(data) {
        resolve(data.results || {});
      },
      error: function() {
        resolve({});
      }
    });
  });
}

export function createProduct(formData) {
    $.ajax({
        url: "api/produtos.php",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        xhrFields: { withCredentials: true },
        success: function(response) {
            if (response.success) {
                console.log("Produto criado com sucesso:", response);
                alert("Produto criado com sucesso!");
                //showToast("Sucesso", "Produto criado com sucesso!");
                getMyProducts();
            } else {
                alert("Erro ao criar produto.");
                //showToast("Erro", "Erro ao criar produto.");
            }
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.error("Erro ao criar produto:", error);
            alert("Erro ao criar produto.");
            //showToast("Erro", "Erro ao criar produto.");
        }
    });
}

export function updateProduct(formData) {
  console.log("Enviando para atualização:", {
    id: formData.get('id'),
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    condition_id: formData.get('condition_id'), // Verifique se está presente
    usage_time: formData.get('usage_time')      // Verifique se está presente
  });
  $.ajax({
    url: "api/produtos.php",
    type: "POST",
    processData: false,
    contentType: false,
    data: formData,
    xhrFields: { withCredentials: true },
    success: function(response) {
      if (response.success) {
        alert("Produto atualizado com sucesso!");
        getMyProducts();
      } else {
        alert("Erro ao atualizar produto.");
      }
    },
    error: function(xhr, status, error) {
      alert("Erro ao atualizar produto.");
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
            //showToast("Sucesso", "Produto deletado com sucesso!");
            getMyProducts();
        } else {
            alert("Erro ao deletar produto.");
            //showToast("Erro", "Erro ao deletar produto.");
        }
        },
        error: function(xhr, status, error) {
        console.error("Erro ao deletar produto:", error);
        alert("Erro ao deletar produto.");
        //showToast("Erro", "Erro ao deletar produto.");
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
                //showToast("Erro", "Erro ao deslogar usuário.");
                console.error("Erro ao deslogar usuário:", response);
            }
        },
        error: function(xhr, status, error) {
            console.error("Erro ao deslogar usuário:", error);
            alert("Erro ao deslogar usuário.");
            //showToast("Erro", "Erro ao deslogar usuário.");
        }
    });
}

export function getMyProductsPromise() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "api/produtos.php/myproducts",
      type: "GET",
      dataType: "json",
      xhrFields: { withCredentials: true },
      success: resolve,
      error: reject
    });
  });
}

export function switchRequest(productId, productRequesterId){
    $.ajax({
        url: "api/requests.php",
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        xhrFields: { withCredentials: true },
        data: JSON.stringify({
            product_id: productId,
            product_requester_id: productRequesterId 
        }),
        success: function(response) {
            if (response.success) {
                console.log("Requisição switch bem sucedida:", response);
                alert("Requisição switch bem sucedida!");
                //showToast("Sucesso", "Requisição switch bem sucedida!");
                navigateTo("home");
            } else {
                alert("Erro ao realizar requisição switch.");
                //showToast("Erro", "Erro ao realizar requisição switch.");
            }
            console.log(response)
        },
        
        error: function(xhr, status, error) {
            console.error("Erro ao realizar requisição switch:", error);
            alert("Erro ao realizar requisição switch.");
            //showToast("Erro", "Erro ao realizar requisição switch.");
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

  export function updateRequestStatus(requestId, status) {
    return $.ajax({
      url: "api/requests.php",
      type: "PUT",
      data: JSON.stringify({ request_id: requestId, status: status }),
      contentType: "application/json",
      dataType: "json",
      xhrFields: { withCredentials: true }
    });
  }
  
  
  export async function acceptTrade(tradeId) {
    const res = await fetch('api/chat/accept_trade.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade_id: tradeId })
    });
    const data = await res.json();
    if (data.success) {
      return data
    }
  }


  export async function marcarTrocaConcluida(conversationId) {
    const res = await fetch('api/concluir_troca.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversation_id: conversationId })
    });
    const data = await res.json();
    if (data.finalizado) {
      alert("Troca concluída por ambos! Conversa e produtos removidos.");
      closeChat();
      loadUserConversations();
    } else {
      alert("Você marcou como concluída. Aguarde o outro usuário.");
    }
  }

  export async function cancelarTroca(conversationId) {
    const res = await fetch('api/cancelar_troca.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversation_id: conversationId })
    });
    const data = await res.json();
    if (data.success) {
      alert("Troca cancelada! Conversa, e solicitação removidos.");
      closeChat();
      loadUserConversations();
    } else {
      alert("Erro ao cancelar troca.");
    }
  }

  export async function getConditions() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "api/conditions.php",
        type: "GET",
        dataType: "json",
        success: resolve,
        error: reject
      });
    });
  }
  
  
  export async function getConditionById(id) {
    try {
      const conditions = await getConditions();
      return conditions.find(condition => condition.id == id);
    } catch (error) {
      console.error("Erro ao buscar condição:", error);
      return null;
    }
  }