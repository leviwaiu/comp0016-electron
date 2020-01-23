'use strict'


const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;

if(document.getElementById('analyse-form') !== null) {
    let file;

    document.getElementById('file-select').addEventListener('click', async (evt) => {
        evt.preventDefault();
        const file_promise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openFile'] });
        file = file_promise.filePaths[0];
        document.getElementById('filename').innerText = file;
    })
    document.getElementById('analyse-button').addEventListener('click', (evt) => {
            evt.preventDefault();
            const service = document.getElementById('service-select').value

            ipcRenderer.send('analyse-form-submission', service, file);
        })
    document.getElementById("logout-button").addEventListener('click', (evt) => {
        evt.preventDefault();
        ipcRenderer.send('logout');
    })
}


if(document.getElementById('login-form') !== null) {
    document.getElementById('login-form').addEventListener('submit', (evt) => {
        evt.preventDefault()
        const input = evt.target[0]

        ipcRenderer.send('login-form-submission', input.value)
    })
}

