'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;

ipcRenderer.on('display-data', function(event,store){
  document.getElementById('table-content').innerHTML = store;
})

document.getElementById("return-button").addEventListener("click", async(evt) => {
    ipcRenderer.send('return-button-results');
});

document.getElementById('delete-button').addEventListener('click', () => {
  ipcRenderer.send('delete-temp-file');
})


ipcRenderer.on('file-delete-successful', async function(){
  await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "info",
    title: "Delete Successful",
    message: "The temporary file has been deleted",
    buttons:["OK"]
  })
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