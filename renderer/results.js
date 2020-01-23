'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
const fileUrl = require('file-url');
const path = require('path');

let fileSaved = false;

ipcRenderer.on('display-data', function(event,store){
  document.getElementById('table-content').innerHTML = store;
})

document.getElementById("return-button").addEventListener("click", async(evt) => {
  if(!fileSaved) {
    const fileConfirm = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: "warning",
      title: "Quit Warning",
      message: "Are you sure?",
      detail: "You have not saved. Are you sure you want to quit?",
      buttons: ["Yes", "No"]
    });
    if(fileConfirm.response === 0){
      ipcRenderer.send('return-to-login');
    }
  } else {
    ipcRenderer.send('return-to-login');
  }
});

document.getElementById('save-button').addEventListener("click", async (evt) => {
  evt.preventDefault();
  const saveLocation = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow());
  ipcRenderer.send('save-file', saveLocation);
})

ipcRenderer.on('successful-save', function(event){
  fileSaved = true;
})