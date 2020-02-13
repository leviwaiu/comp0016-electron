const {ipcRenderer} = require('electron');

const continue_button = document.getElementById('continue-button');
const log_field = document.getElementById('log-card');
const progress_bar = document.getElementById("progress-bar");
const log_button = document.getElementById('log-button');
progress_bar.style.width = "10%";

let log_opened = false;

log_button.addEventListener('click', ()=>{
  if(!log_opened){
    log_field.classList.remove("invisible");
    log_opened = true;
    log_button.innerText = "Hide  Logs";
  }
  else {
    log_field.classList.add("invisible");
    log_opened = false;
    log_button.innerText = "Show Logs";
  }
})

ipcRenderer.on('log-data', (event, data) => {
  document.getElementById('log-output').innerText += data;
});



ipcRenderer.on('analyse-finish', () => {
  console.log("recieved")
  continue_button.classList.remove("invisible");
})

continue_button.addEventListener('click', () => {
  ipcRenderer.send('analyse-continue')
})