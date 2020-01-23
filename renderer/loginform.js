'use strict'
const {ipcRenderer} = require('electron');


document.getElementById('login-form').addEventListener('submit', (evt) => {
    evt.preventDefault()
    const input = evt.target[0]

    ipcRenderer.send('login-form-submission', input.value)
});


