const {ipcRenderer} = require('electron');

const continue_button = document.getElementById('continue-button');
const log_field = document.getElementById('log-card');
document.getElementById("progress-bar").style.width = "10%";

let log_opened = false;
document.getElementById("log-button").addEventListener('click', ()=>{
  if(log_opened){
    log_field.classList.remove("invisible");
    log_opened = false;
  }
  else {
    log_field.classList.add("invisible");
    log_opened = true;
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