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
      ipcRenderer.send('return-to-intermediate');
    }
  } else {
    ipcRenderer.send('return-to-intermediate');
  }
});

document.getElementById('save-button').addEventListener("click", async (evt) => {
  evt.preventDefault();
    ipcRenderer.send('save-file');
  
})

document.getElementById('delete-button').addEventListener('click', () => {
  ipcRenderer.send('delete-temp-file');
})


ipcRenderer.on('successful-save', async function(event){
  const successful = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: "info",
      title: "Save Successful",
      message: "The save has been successful",
      buttons:["OK"]
  });
  fileSaved = true;
  console.log(fileSaved);
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