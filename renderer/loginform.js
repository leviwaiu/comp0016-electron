'use strict'
const {ipcRenderer} = require('electron');
<<<<<<< Updated upstream
=======
const {BrowserWindow} = require('electron').remote;
const path = require('path');
let newWindow;
>>>>>>> Stashed changes


document.getElementById('login-form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    const username = evt.target[0];
    const password = evt.target[1];

    console.log(username.value);
    console.log(password.value)

    ipcRenderer.send('login-form-submission', username.value, password.value);
});
<<<<<<< Updated upstream

=======
document.getElementById('signup-form').addEventListener('click', () =>{
    newWindow = new BrowserWindow( {
        height:300,
        width:500
      });
      newWindow.loadFile(path.join('renderer', 'signup.html'));
})

ipcRenderer.on('close-signup-window',function(){
    newWindow.close();
})
>>>>>>> Stashed changes

ipcRenderer.on('login-error', function(){
    document.getElementById('login-fail').classList.remove('invisible');
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
})