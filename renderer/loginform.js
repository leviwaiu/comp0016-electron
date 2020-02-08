'use strict'
const {ipcRenderer} = require('electron');
const {BrowserWindow} = require('electron').remote;
const path = require('path');
let newWindow;


document.getElementById('login').addEventListener('click', function(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    ipcRenderer.send('login-form-submission', username, password);
});

document.getElementById('signup').addEventListener('click', function(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    ipcRenderer.send('signup-submission', username, password);
})

ipcRenderer.on('login-error', function(){
    document.getElementById('login-fail').classList.remove('invisible');
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
})

document.getElementById('test-button').addEventListener('click', (evt)=> {
    evt.preventDefault();
    ipcRenderer.send('debug-test-watson-npm');
})