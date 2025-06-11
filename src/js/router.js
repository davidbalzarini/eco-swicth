import { getCategories, getMyProducts, getProducts, getProductById } from "./api.js";
import { initModalEvents, loadCategories, loadProducts, loadUserConversations, renderHomeWithPagination, renderNotifications, renderProductDetail } from "./ui.js"; // Add renderProductDetail

export async function navigateTo(page, productId = null) {
    try {
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      document.getElementById("content").innerHTML = html;
    
      if (page === "home") {
        initModalEvents();
        const products = await getProducts(); 
        const categories = await getCategories();
         
        renderHomeWithPagination(1, 5);
        loadCategories(categories);
      }
      if( page === "products") {
        initModalEvents();
        getMyProducts();
      }
      if (page === "notifications") {
        renderNotifications();
      }
      if (page === "chat") {
        loadUserConversations();
      }
      if (page === "product-detail" && productId) {
        const product = await getProductById(productId);
        if (product) {
            renderProductDetail(product);
        } else {
            document.getElementById("content").innerHTML = "<h1>Produto não encontrado</h1>";
        }
      }

    } catch (error) {
      document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
      console.error("Erro ao carregar a página:", error);
    }
    
    if (productId) {
      window.history.pushState({ productId: productId }, "", `/${page}?id=${productId}`);
    } else {
      window.history.pushState({}, "", `/${page}`);
    }
  }