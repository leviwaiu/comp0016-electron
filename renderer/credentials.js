'use strict'

const {ipcRenderer} = require('electron');

let isPasswordMode = false;

const service_username = document.getElementById('service-username')
const service_password = document.getElementById('service-password')

document.getElementById('usernameButton').addEventListener('click',function(){
  isPasswordMode = true;
  document.getElementById('API').hidden = true
  document.getElementById('apiKeyButton').disabled = false
  document.getElementById('username').hidden = false
  document.getElementById('usernameButton').disabled = true
})

document.getElementById('apiKeyButton').addEventListener('click',function(){
  isPasswordMode = false;
  document.getElementById('API').hidden = false
  document.getElementById('apiKeyButton').disabled = true
  document.getElementById('username').hidden = true
  document.getElementById('usernameButton').disabled = false
})

document.getElementById('cancel-button').addEventListener('click', function () {
  window.close()
})

document.getElementById('return-button').addEventListener('click', function () {
  if(isPasswordMode) {
    let username = service_username.value
    let password = service_password.value
    if (username === '') username = 'alighariani99@gmail.com'
    if (password === '') password = 'abcdeabcde'
    ipcRenderer.send('credentials-change', username, password)
  } else {
    let api = document.getElementById('apiKey').value;
    ipcRenderer.send('credentials-change-apiKey', api);
  }
  window.close()
})

ipcRenderer.on('window-close', function() {
  window.close();
})
