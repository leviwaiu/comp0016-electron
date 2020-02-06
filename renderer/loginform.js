'use strict'
const {ipcRenderer} = require('electron');


document.getElementById('login-form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    const username = evt.target[0];
    const password = evt.target[1];

    console.log(username.value);
    console.log(password.value)

    ipcRenderer.send('login-form-submission', username.value, password.value);
});


ipcRenderer.on('login-error', function(){
    document.getElementById('login-fail').classList.remove('invisible');
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
})

document.getElementById('test-button').addEventListener('click', (evt)=> {
    evt.preventDefault();
    ipcRenderer.send('debug-test-watson-npm');
})