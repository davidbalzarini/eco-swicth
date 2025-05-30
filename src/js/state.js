import { renderUI } from "./ui.js";



const state = {
  logged: false
}
  
export function setLogged(value){ 
  state.logged = value;
  renderUI();
}
  
export function isLogged(){
  return state.logged;
}