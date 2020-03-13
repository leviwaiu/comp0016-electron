'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
let filepath = null;

ipcRenderer.on('display-data', function(event, store, path){
  document.getElementById('table-content').innerHTML = store;
  filepath = path;
  console.log(filepath);
})

document.getElementById("return-button").addEventListener("click", async(evt) => {
    evt.preventDefault();
    ipcRenderer.send('return-button-result');
});

document.getElementById('delete-button').addEventListener('click', async(evt) => {
  evt.preventDefault();
  ipcRenderer.send('delete-file', filepath);
})


ipcRenderer.on('file-delete-error', async function(){
  await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "info",
    title: "Delete Failed",
    message: "Delete Failed",
    detail: "Something went wrong when deleting the temporary form",
    buttons:["OK"]
  })
})