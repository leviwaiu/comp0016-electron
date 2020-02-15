// 'use strict'

// const {ipcRenderer} = require('electron');

const service_username = document.getElementById('service-username')
const service_password = document.getElementById('service-password')

document.getElementById('usernameButton').addEventListener('click',function(){
  document.getElementById('API').hidden = true
  document.getElementById('apiKey').disabled = false
  document.getElementById('username').hidden = false
  document.getElementById('usernameButton').disabled = true
})

document.getElementById('apiKey').addEventListener('click',function(){
  document.getElementById('API').hidden = false
  document.getElementById('apiKey').disabled = true
  document.getElementById('username').hidden = true
  document.getElementById('usernameButton').disabled = false
})

document.getElementById('cancel-button').addEventListener('click', function () {
  // console.log("cancel");
  window.close()
})

document.getElementById('return-button').addEventListener('click', function () {
  var username = service_username.value
  var password = service_password.value
  if (username === '') username = 'alighariani99@gmail.com'
  if (password === '') password = 'abcdeabcde'
  // service_password.value = "What";
  // console.log("tero");
  ipcRenderer.send('credentials-change', username, password)
  window.close()
})
