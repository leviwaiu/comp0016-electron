'use strict'
const {ipcRenderer} = require('electron');

let usernameField = document.getElementById('username');
let passwordField = document.getElementById('password');

document.getElementById('login').addEventListener('click', function(){
    let username = usernameField.value;
    let password = passwordField.value;
    ipcRenderer.send('login-form-submission', username, password);
});

document.getElementById('signup').addEventListener('click', function(){
    let username = usernameField.value
    let password = passwordField.value;
    ipcRenderer.send('signup-submission', username, password);
})

ipcRenderer.on('login-error', function(event, details, title){
    document.getElementById('login-fail-title').innerText = title;
    document.getElementById('login-fail-details').innerText = details;
    document.getElementById('login-fail').classList.remove('invisible');
})
