import { checkLoginStatus, confirmResgister, handleLogin, logout, validatePasswords } from "./api.js";
import { navigateTo } from "./router.js";
import { setLogged } from "./state.js";
import { loadFooter, renderUI, searchProducts } from "./ui.js";

window.navigateTo = navigateTo;
window.setLogged = setLogged;
window.handleLogin = handleLogin
window.validatePasswords = validatePasswords;
window.confirmResgister = confirmResgister
window.logout = logout


$(document).ready(() => {
    checkLoginStatus();
    renderUI();
    navigateTo("home");
    loadFooter();
  
    $(document).on("input", ".search-input", function() {
      searchProducts();
    });
  });