const {ipcRenderer} = require('electron');

const continue_button = document.getElementById('continue-button');
const log_field = document.getElementById('log-card');
const progress_bar = document.getElementById("progress-bar");
const log_button = document.getElementById('log-button');
let progress = 0;
progress_bar.style.width = progress.toString() + "%";

let log_opened = false;
let log_data = [];

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
  log_data.push(data);
  console.log(log_data);
  document.getElementById('log-output').innerHTML = "";
  for(let i = 0; i < log_data.length; i++) {
    document.getElementById('log-output').innerHTML += log_data[i] + "<br \>";
  }
});

ipcRenderer.on('update-bar', (event, increment) => {
  console.log("Gotten the update-bar");
  progress_bar.style.width = increment.toString() + "%";
})

ipcRenderer.on('error-bar', (event) =>{
  progress_bar.style.color = "red";
})

ipcRenderer.on('analyse-finish', () => {
  continue_button.classList.remove("invisible");
})

continue_button.addEventListener('click', () => {
  ipcRenderer.send('analyse-continue')
})

document.getElementById("Cancel").addEventListener('click', function () {
  ipcRenderer.send("analyse-cancel")
})