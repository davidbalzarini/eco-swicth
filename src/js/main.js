import { checkLoginStatus, confirmResgister, handleLogin, logout, validatePasswords } from "./api.js";
import { navigateTo } from "./router.js";
import { setLogged } from "./state.js";
import { closeChat, loadFooter, renderUI, searchProducts } from "./ui.js";

window.navigateTo = navigateTo;
window.setLogged = setLogged;
window.handleLogin = handleLogin
window.validatePasswords = validatePasswords;
window.confirmResgister = confirmResgister
window.logout = logout
window.closeChat = closeChat


$(document).ready(() => {
    checkLoginStatus();
    renderUI();
    navigateTo("home");
    loadFooter();
    $('.menu-btn').on('click', function() {
      $('.navbar-mobile').css('display', 'flex');
    });
  
    if ($('.navbar-mobile .close-mobile').length === 0) {
      $('.navbar-mobile').prepend('<button class="close-mobile" ...>&times;</button>');
    }
    $('.navbar-mobile').on('click', '.close-mobile', function() {
      $('.navbar-mobile').css('display', 'none');
    });
  
    $('.navbar-mobile a').on('click', function() {
      $('.navbar-mobile').css('display', 'none');
    });

    $(document).on('keypress', '.search-input', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        searchProducts();
      }
    });
  });