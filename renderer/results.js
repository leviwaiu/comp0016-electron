'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
const fileUrl = require('file-url');
const path = require('path');

ipcRenderer.on('display-data', function(event,store){
  document.getElementById('table-content').innerHTML = store;
})

document.getElementById("return-button").addEventListener("click", (evt) => {
  ipcRenderer.send('return-to-login');
});

document.getElementById('save-button').addEventListener("click", async (evt) => {
  evt.preventDefault();
  const saveLocation = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow());
  ipcRenderer.send('save-file', saveLocation);
})