import { acceptTrade, cancelarTroca, createProduct, deleteProduct, getCategories, getCategoryById, getMyProducts, getMyProductsPromise, getNotifications, getProducts, getProductsPaginated, hasRequested, marcarTrocaConcluida, switchRequest, updateProduct, updateRequestStatus } from "./api.js";
import { navigateTo } from "./router.js";
import { isLogged } from "./state.js";

let products = getProducts();


function toggleMenu() {
  document.querySelector(".navbar").classList.toggle("active");
}


export async function searchProducts() {
    const term = document.querySelector(".search-input").value.toLowerCase();
    const products = await getProducts(); 
    const filteredProducts = products.products.filter(product => product.name.toLowerCase().includes(term));
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

export async function renderHomeWithPagination(page = 1, limit = 12) {
  const data = await getProductsPaginated(page, limit);
  const products = data.products || data;
  const total = data.total || products.length;

  loadProducts(products, "productList");

  const totalPages = Math.ceil(total / limit);
  const paginationDiv = document.getElementById("pagination") || document.createElement("div");
  paginationDiv.id = "pagination";
  paginationDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === page) ? "active" : "";
    btn.onclick = () => renderHomeWithPagination(i, limit);
    paginationDiv.appendChild(btn);
  }

  const productList = document.getElementById("productList");
  if (productList && !document.getElementById("pagination")) {
    productList.parentNode.appendChild(paginationDiv);
  }
}

export async function loadProducts(list = products, idList = "productList") {


  if(idList === "myProductList" && !isLogged()){
    alert("Você precisa estar logado para ver seus produtos.");
    //showToast("Atenção", "Você precisa estar logado para ver seus produtos.");
    navigateTo("login");
    return;
  }
  
  const productList = document.getElementById(idList);
  if (!productList) {
    console.error(`Elemento #${idList} não encontrado no DOM.`);
    return;
  }
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
      showCreateProductModal();
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
    productImg.src = item.image + '?v=' + new Date().getTime();
    productImg.alt = item.name;
    productImg.classList.add("product-image");

    const productName = document.createElement("p");
    productName.textContent = item.name;

    if (item.user_id === localStorage.getItem("userId")) {
      const updateButton = document.createElement("button");
      updateButton.textContent = "Alterar produto";
      updateButton.classList.add("product-button");
      updateButton.onclick = () => {
        showEditProductModal(item);
      }

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Deletar produto";
      deleteButton.classList.add("product-button");
      deleteButton.onclick = () => {
        showDeleteProductModal(item.id);
      };

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
        swapButton.onclick = () => abrirSwapRequestModal(item.id);
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


export async function abrirSwapRequestModal(produtoAlvoId) {
  const meusProdutos = await getMyProductsPromise();
  showSwapRequestModal(produtoAlvoId, meusProdutos);
}

export function renderUI() {
  const logged = isLogged();

  document.getElementById('login-buttons').style.display = logged ? 'none' : 'block';
  document.getElementById('logout').style.display = logged ? 'block' : 'none';
}
  
  export function fecharModal() {
    const modal = document.getElementById("modal-bg");
    if (modal) modal.style.display = "none";
  }

  export async function initModalEvents() {
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.onclick = closeModal;
  
    const cancelBtn = document.getElementById("cancelar-modal");
    if (cancelBtn) cancelBtn.onclick = closeModal;

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
        const formData = new FormData();
        formData.append("name", nome);
        formData.append("category_id", categoria);
        formData.append("user_id", userId);
        const imagemInput = document.getElementById("imagem-produto");

        createProduct(formData);
        closeModal();

      };
    }
  }



function animarTroca(card1) {
    const notificationCard = card1.closest('.notification-card');
    const overlay = document.getElementById('swap-overlay');

    const cardRect = notificationCard.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const cardClone = notificationCard.cloneNode(true);
    cardClone.style.position = 'absolute';
    cardClone.style.top = (cardRect.top + scrollTop) + 'px';
    cardClone.style.left = (cardRect.left + scrollLeft) + 'px';
    cardClone.style.width = cardRect.width + 'px';
    cardClone.style.height = cardRect.height + 'px';
    cardClone.style.margin = 0;
    cardClone.style.zIndex = 2000;
    cardClone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';

    document.body.appendChild(cardClone);
    notificationCard.style.visibility = 'hidden';

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    overlay.style.pointerEvents = 'none';

    const sides = cardClone.querySelectorAll('.product-side');
    const productsRow = cardClone.querySelector('.products-row');
    const swapButton = cardClone.querySelector('.swap-icon');
    const swapRect = swapButton.getBoundingClientRect(); 

    const centerX = (swapRect.left + swapRect.width / 2) + scrollLeft;
    const centerY = (swapRect.top + swapRect.height / 2) + scrollTop;

    sides.forEach(side => {
      const sideRect = side.getBoundingClientRect();
      const offsetX = centerX - (sideRect.left + scrollLeft);
      const offsetY = centerY - (sideRect.top + scrollTop);

      side.style.transformOrigin = `${offsetX}px ${offsetY}px`;

      const sideComputedStyle = window.getComputedStyle(side);

      const inner = document.createElement('div');
      inner.classList.add('inner-content');

      while (side.firstChild) {
          inner.appendChild(side.firstChild);
      }
      side.appendChild(inner);

      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.margin = '0';
      inner.style.padding = '0';
      inner.style.boxSizing = 'border-box';

      if (sideComputedStyle.textAlign && sideComputedStyle.textAlign !== 'start') {
          inner.style.textAlign = sideComputedStyle.textAlign;
      }
      if (sideComputedStyle.display === 'flex' || sideComputedStyle.display === 'inline-flex') {
          inner.style.display = 'flex';
          inner.style.flexDirection = sideComputedStyle.flexDirection;
          inner.style.alignItems = sideComputedStyle.alignItems;
          inner.style.justifyContent = sideComputedStyle.justifyContent;
          if (sideComputedStyle.gap && sideComputedStyle.gap !== 'normal') {
              inner.style.gap = sideComputedStyle.gap;
          }
      } else {
          if (!inner.style.display) {
               inner.style.display = 'block';
          }
      }
  });

    const tl = gsap.timeline({
        onComplete: () => {
            swapProductSides(productsRow);

            gsap.to(cardClone, {
                top: cardRect.top + scrollTop, 
                left: cardRect.left + scrollLeft,
                scale: 1,
                duration: 0,
                ease: "power2.inOut",
                onComplete: () => {
                    const realRow = notificationCard.querySelector('.products-row');
                    swapProductSides(realRow);

                    notificationCard.style.visibility = 'visible';
                    overlay.style.display = 'none';
                    overlay.classList.remove('active'); 
                    cardClone.remove();
                }
            });
        }
    });

    tl.to(cardClone, {
        scale: 1.2,
        duration: 0.5,
        ease: "power2.inOut"
    });
    tl.to(sides, {
        rotation: 180,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: function() {
            this.targets().forEach(side => {
                const inner = side.querySelector('.inner-content');
                if (inner) {
                    const parentRotation = gsap.getProperty(side, "rotation");
                    inner.style.transform = `rotate(${-parentRotation}deg)`;
                }
            });
        }
    });

    tl.to(cardClone, {
        scale: 1, 
        duration: 0.5,
        ease: "power2.inOut"
    });
}




function swapProductSides(productsRow) {
    const left = productsRow.querySelectorAll('.product-side')[0];
    const right = productsRow.querySelectorAll('.product-side')[1];
    const swapIcon = productsRow.querySelector('.swap-icon');
    productsRow.insertBefore(right, swapIcon);
    productsRow.appendChild(left);
}


export async function renderNotifications() {
  if (!isLogged()) {
    navigateTo("login");
    alert("Você precisa estar logado para ver suas notificações.");
    //showToast("Atenção", "Você precisa estar logado para ver suas notificações.");
    
    return;
  }
    const notifications = await getNotifications();
    const container = document.getElementById("notificationsList");
    container.innerHTML = "";

    if (notifications.length === 0) {
        container.innerHTML = `<p style="text-align:center;margin:40px 0;font-size:1.1em;color:#888;">Sem notificações</p>`;
        return;
    }

    for (let idx = 0; idx < notifications.length; idx++) {
        const n = notifications[idx];
        const card = document.createElement("div");
        card.className = "notification-card";
        card.id = `notification-card-${idx}`;

        card.innerHTML = (n.status === 'pending') ? `
            <div class="products-row">
                <div class="product-side">
                    <img src="${n.product_image}" alt="${n.product_name}" class="product-img">
                    <span class="product-label">Seu produto</span>
                    <span class="product-name">${n.product_name}</span>
                </div>
                <div class="swap-icon">
                    <span>⇄</span>
                </div>
                <div class="product-side">
                    <img src="${n.product_requester_image}" alt="${n.product_requester_name}" class="product-img">
                    <span class="product-label">Oferecido por ${n.requester_name}</span>
                    <span class="product-name">${n.product_requester_name}</span>
                </div>
            </div>
            <div class="notification-info">
                <span class="notification-date">${new Date(n.created_at).toLocaleString()}</span>
                <span class="notification-status status-${n.status}">
                    ${n.status === "pending" ? "Pendente" : n.status === "accepted" ? "Aceita" : "Recusada"}
                </span>
            </div>
            <div class="notification-actions">
              ${n.status === "pending" ? `
                <button class='accept-btn'>Aceitar</button>
                <button class='reject-btn'>Reprovar</button>
              ` : ''}
            </div>
        ` : n.status === 'accepted' ? `
            <div class="products-row">
                <div class="product-side">
                    <img src="${n.product_requester_image}" alt="${n.product_requester_name}" class="product-img">
                    <span class="product-label">Oferecido por ${n.requester_name}</span>
                    <span class="product-name">${n.product_requester_name}</span>
                </div>
                <div class="swap-icon">
                    <span>⇄</span>
                </div>
                <div class="product-side">
                    <img src="${n.product_image}" alt="${n.product_name}" class="product-img">
                    <span class="product-label">Seu produto</span>
                    <span class="product-name">${n.product_name}</span>
                </div>
            </div>
            <div class="notification-info">
                <span class="notification-date">${new Date(n.created_at).toLocaleString()}</span>
                <span class="notification-status status-${n.status}">
                    ${n.status === "pending" ? "Pendente" : n.status === "accepted" ? "Aceita" : "Recusada"}
                </span>
            </div>
            <div class="notification-actions">
              ${n.status === "pending" ? `
                <button class='accept-btn'>Aceitar</button>
                <button class='reject-btn'>Reprovar</button>
              ` : ''}
            </div>
        ` : '';

        const acceptBtn = card.querySelector(".accept-btn");
        const rejectBtn = card.querySelector(".reject-btn");
        if (acceptBtn) {
          acceptBtn.onclick = async () => {
            const sides = card.querySelectorAll('.product-side');
            try {
              const data = await acceptTrade(n.request_id);
              await updateRequestStatus(n.request_id, "accepted");
              animarTroca(sides[0]);
              await renderNotifications();
              console.log("Troca aceita:", data);
              await new Promise(resolve => setTimeout(resolve, 4000));
              if (data && data.conversation_id) {
                await navigateTo('chat');
                openChat(data.conversation_id);
              }
            } catch (e) {
              alert("Erro ao aceitar troca!");
              //showToast("Erro", "Erro ao aceitar troca!");
              console.error("Erro ao aceitar troca:", e);
            }
          };
        }
        
        if (rejectBtn) {
  
          rejectBtn.onclick = async () => {
            const sides = card.querySelectorAll('.product-side');
            try {
              await updateRequestStatus(n.request_id, "reject");
              alert("Troca rejeitada!");
              //showToast("", "Troca rejeitada!");
              await renderNotifications();
            } catch (e) {
              alert("Erro ao rejeitar troca!");
              //showToast("Erro", "Erro ao rejeitar troca!");
            }
          };
        }

        container.appendChild(card);
    };
}


  export function openModal(htmlContent, onOpen = null, onClose = null) {
    const modalBg = document.getElementById("modal-bg");
    const modalContent = document.getElementById("modal-content");
    modalContent.innerHTML = htmlContent;
    modalBg.style.display = "flex";
    const closeBtn = modalContent.querySelector(".modal-close");
    if (closeBtn) closeBtn.onclick = () => closeModal(onClose);
    if (onOpen) onOpen(modalContent);
  }
  
  export function closeModal(onClose = null) {
    document.getElementById("modal-bg").style.display = "none";
    if (onClose) onClose();
  }


  export function showCreateProductModal() {
    openModal(`
      <button class="modal-close" title="Fechar">&times;</button>
      <h3>Criar novo anúncio</h3>
      <form id="form-anuncio">
        <!-- campos -->
        <label>Nome</label><input type="text" id="nome-produto" required>
        <label>Imagem</label><input type="file"  id="imagem-produto" accept="image/*" required>
        <label>Categoria</label>
        <select id="categoria-produto"></select>
        <div class="modal-actions">
          <button type="button" class="cancel">Cancelar</button>
          <button type="submit" class="submit">Criar</button>
        </div>
      </form>
    `, async (modal) => {
      const cats = await getCategories();
      const select = modal.querySelector("#categoria-produto");
      cats.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.descricao;
        select.appendChild(opt);
      });
      modal.querySelector(".cancel").onclick = closeModal;
      modal.querySelector("#form-anuncio").onsubmit = function(e) {
        e.preventDefault();
        const nome = modal.querySelector("#nome-produto").value;
        const imagemInput = modal.querySelector("#imagem-produto");
        const categoria = modal.querySelector("#categoria-produto").value;
        const userId = localStorage.getItem("userId");
        
        const formData = new FormData();
        formData.append("name", nome);
        formData.append("category_id", categoria);
        formData.append("user_id", userId);
        formData.append("image", imagemInput.files[0]);

        createProduct(formData);
        closeModal();
      };
    });
  }


  export function showEditProductModal(produto) {
    openModal(`
      <button class="modal-close" title="Fechar">&times;</button>
      <h3>Alterar produto</h3>
      <form id="form-anuncio">
        <label>Nome</label><input type="text" id="nome-produto" value="${produto.name}" required>
        <label>Imagem</label><input type="file" id="imagem-produto" accept="image/*">
        <label>Categoria</label>
        <select id="categoria-produto"></select>
        <div class="modal-actions">
          <button type="button" class="cancel">Cancelar</button>
          <button type="submit" class="submit">Salvar</button>
        </div>
      </form>
    `, async (modal) => {
      const cats = await getCategories();
      const select = modal.querySelector("#categoria-produto");
      cats.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.descricao;
        if (cat.id == produto.category_id) opt.selected = true;
        select.appendChild(opt);
      });
      modal.querySelector(".cancel").onclick = closeModal;
      modal.querySelector("#form-anuncio").onsubmit = function(e) {
        e.preventDefault();
        const nome = modal.querySelector("#nome-produto").value;
        const imagemInput = modal.querySelector("#imagem-produto");
        const categoria = modal.querySelector("#categoria-produto").value;
  
        const formData = new FormData();
        formData.append("id", produto.id);
        formData.append("name", nome);
        formData.append("category_id", categoria);
        if (imagemInput.files.length > 0) {
          formData.append("image", imagemInput.files[0]);
        }
  
        updateProduct(formData);
        closeModal();
      };
    });
  }

  export function showDeleteProductModal(productId) {
    openModal(`
      <button class="modal-close" title="Fechar">&times;</button>
      <h3>Tem certeza que deseja apagar o produto?</h3>
      <form id="form-anuncio">
        <div class="modal-actions">
          <button type="button" class="cancel">Cancelar</button>
          <button type="submit" class="submit">Apagar</button>
        </div>
      </form>
    `, async (modal) => {
      modal.querySelector(".cancel").onclick = closeModal;
      modal.querySelector("#form-anuncio").onsubmit = function(e) {
        e.preventDefault();
        deleteProduct(productId)
        closeModal();
      };
    });
  }


  export function showSwapRequestModal(produtoAlvo, meusProdutos) {
    openModal(`
      <button class="modal-close" title="Fechar">&times;</button>
      <h3>Escolha um produto para oferecer na troca</h3>
      <form id="swap-form">
        <label>Meu produto</label>
        <select id="meu-produto" required>
          ${meusProdutos.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
        <div class="modal-actions">
          <button type="button" class="cancel">Cancelar</button>
          <button type="submit" class="submit">Solicitar</button>
        </div>
      </form>
    `, (modal) => {
      modal.querySelector(".cancel").onclick = closeModal;
      modal.querySelector("#swap-form").onsubmit = function(e) {
        e.preventDefault();
        const meuProdutoId = modal.querySelector("#meu-produto").value;
        switchRequest(produtoAlvo, meuProdutoId)
          .then(() => {
            alert("Solicitação de troca enviada!");
            //showToast("Sucesso", "Solicitação de troca enviada!");
          })
          .catch(err => {
            console.error("Erro ao solicitar troca:", err);
            alert("Erro ao solicitar troca. Tente novamente.");
            //showToast("Erro", "Erro ao solicitar troca. Tente novamente.");
          });
        closeModal();
      };
    });
  }






  //chat:

  let socket;
  let currentConversationId = null;
  
  export function openChat(conversationId, userId) {

    document.getElementById('btn-concluir-troca').onclick = async function() {
      if (confirm("Tem certeza que deseja marcar a troca como concluída?")) {
        await marcarTrocaConcluida(conversationId);
      }
    };
    document.getElementById('btn-cancelar-troca').onclick = async function() {
      if (confirm("Tem certeza que deseja cancelar a troca? Isso apagará a conversa e os produtos.")) {
        await cancelarTroca(conversationId);

      }
    };
    currentConversationId = conversationId;
    document.getElementById('chat-modal').style.display = 'flex';
  
    $.getJSON(`api/chat/load_messages.php?conversation_id=${conversationId}&last_id=0`, function(data) {
      document.getElementById('chat-messages').innerHTML = '';
      if (data.messages) {
        data.messages.forEach(addMessageToChat);
      }
    });
    if (!socket) {
      socket = io('http://localhost:3001');
      socket.on('connect', () => console.log('Conectado ao servidor de chat'));
      socket.on('connect_error', (err) => console.error('Erro de conexão:', err));
    }



    console.log("Emitindo join", conversationId);
  
    socket.emit('join', conversationId);
  
    socket.off('chat_message');
    socket.on('chat_message', (msg) => {
      if (msg.conversationId == currentConversationId) {
        addMessageToChat(msg);
      }
    });
  

  
    window.sendMessageUI = function() {
      const content = document.getElementById('chat-input').value;
      if (content.trim()) {
        socket.emit('chat_message', {
          conversationId,
          senderId: localStorage.getItem('userId'), 
          content
        });
        document.getElementById('chat-input').value = '';
      }
    };
  }

  export function closeChat() {
    document.getElementById('chat-modal').style.display = 'none';
    if (socket && currentConversationId) {
      socket.off('chat_message');
      socket.emit('leave', currentConversationId);
    }
    currentConversationId = null;
  }

  function addMessageToChat(msg) {
    const myId = localStorage.getItem('userId');
    const isMine = (msg.senderId == myId || msg.sender_id == myId);
    const chatMessages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    
    div.className = isMine ? 'my-message' : 'other-message';
    div.innerHTML = isMine ? `
      <span class="msg-content">${msg.content || msg.message_content}</span>
      <br>
      <span class="msg-time-my">${msg.sent_at ? msg.sent_at : new Date().toLocaleTimeString()}</span>
    ` : 
    `
      <span class="msg-content">${msg.content || msg.message_content}</span>
      <br>
      <span class="msg-time-other">${msg.sent_at ? msg.sent_at : new Date().toLocaleTimeString()}</span>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  

  export function loadUserConversations() {
    if (!isLogged()) {
      navigateTo("login");
      alert("Você precisa estar logado para ver suas conversas.");
      //showToast("Atenção", "Você precisa estar logado para ver suas conversas.");
      return;
    }
    $.ajax({
      url: 'api/chat/get_user_conversations.php',
      type: 'GET',
      dataType: 'json',
      success: function(conversations) {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = "<h2>Suas conversas</h2>";
  
        if (!conversations.length) {
          chatList.innerHTML += `<p style="text-align:center;margin:40px 0;font-size:1.1em;color:#888;">Nenhuma conversa encontrada.</p>`;
          return;
        }
  
        console.log("Conversas carregadas:", conversations);
        conversations.forEach(conv => {
          console
          const otherUser = (conv.user1_id == localStorage.getItem("userId")) ? conv.user2_id : conv.user1_id;
          const div = document.createElement('div');
          div.className = "chat-item";
          div.style.cursor = "pointer";
          div.style.padding = "10px";
          div.style.borderBottom = "1px solid #eee";
          div.innerHTML = `
          <div style="display:inline-block;vertical-align:top;text-align:center;width:70px;padding:0 8px;">
            <img src="${conv.other_user_product_image}" alt="Produto" style="width:40px;height:40px;object-fit:cover;border-radius:6px;display:block;margin:0 auto;">
            <div style="font-size:0.85em;color:#888;margin-top:2px;word-break:break-word;">${conv.other_user_product_name}</div>
          </div>
          <div style="display:inline-block;vertical-align:top;margin-left:10px;min-width:150px;">
            <div><strong>${conv.other_user_name}</strong></div>
            <div style="font-size:0.9em;color:#666;">${conv.other_user_email}</div>
          </div>
        `;
          div.onclick = () => openChat(conv.id);
          chatList.appendChild(div);
        });
      },
      error: function(xhr, status, error) {
        alert("Erro ao carregar conversas!");
        console.error(error);
      }
    });
  }