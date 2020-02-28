'use strict'
const {ipcRenderer} = require('electron');

document.getElementById('enter').addEventListener('click', function(){
    ipcRenderer.send('enter-form-submission');
});

if(document.getElementById('test-button') !== null) {
    document.getElementById('test-button').addEventListener('click', function () {
        ipcRenderer.send('debug-test-watson-npm');
    })
}