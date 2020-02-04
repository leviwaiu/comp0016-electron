const {ipcRenderer} = require('electron');

const username = document.getElementById('username');
const password = document.getElementById('password');

document.getElementById('createaccount').addEventListener('click', function(){
    const username = username.value;
    const password = password.value;
    // service_password.value = "What";
    // console.log("tero")
    ipcRenderer.send('close-signup', username, password);
  })