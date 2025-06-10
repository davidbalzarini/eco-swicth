import { getCategories, getMyProducts, getProducts } from "./api.js";
import { initModalEvents, loadCategories, loadProducts, loadUserConversations, renderHomeWithPagination, renderNotifications } from "./ui.js";

export async function navigateTo(page) {
    try {
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      document.getElementById("content").innerHTML = html;
    
      if (page === "home") {
        initModalEvents();
        const products = await getProducts(); 
        const categories = await getCategories();
        // loadProducts(products); 
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
    } catch (error) {
      document.getElementById("content").innerHTML = "<h1>Página não encontrada</h1>";
      console.error("Erro ao carregar a página:", error);
    }
    
    window.history.pushState({}, "", `/${page}`);
  }