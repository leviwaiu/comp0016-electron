'use strict'

const {ipcRenderer} = require('electron');
const path = require('path');
const {dialog, BrowserWindow} = require('electron').remote;

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
document.getElementById('credentials-button').addEventListener('click', (evt) =>{
  const newWindow = new BrowserWindow({
    height:200,
    width:400
  });
  newWindow.loadFile(path.join('renderer', 'credentials.html'))
})