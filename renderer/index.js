'use strict'
const {ipcRenderer} = require('electron');

document.getElementById('enter').addEventListener('click', function(){
    ipcRenderer.send('enter-form-submission');
});

document.getElementById('test-button').addEventListener('click', function(){
    ipcRenderer.send('debug-test-watson-npm');
})