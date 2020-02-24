'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
let files = [];




document.getElementById('selection-delete').addEventListener('click', async (evt) => {
    evt.preventDefault();
    files = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openFile', 'multiSelections']});
    files = files.filePaths;
})

document.getElementById('delete-files').addEventListener('click', (evt) => {
    evt.preventDefault();
    ipcRenderer.send('deletion', files);
  })

document.getElementById('selection-display').addEventListener('click', async (evt) => {
    evt.preventDefault();
    files = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openFile']});
    files = files.filePaths;
})

document.getElementById('display-file').addEventListener('click', (evt) =>{
    evt.preventDefault();
    ipcRenderer.send('displays-file', files)
})

document.getElementById('selection-save').addEventListener('click', async (evt) => {
    evt.preventDefault();
    files = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openFile', "multiSelections"]});
    files = files.filePaths;
})

document.getElementById('save-files').addEventListener('click', (evt)=>{
    evt.preventDefault();
    ipcRenderer.send('save-files', files);
})

document.getElementById('return-button').addEventListener('click', (evt)=>{
    evt.preventDefault();
    ipcRenderer.send('return-to-login');
})

ipcRenderer.on('files-delete-successful', async function(){
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: "info",
      title: "Delete Successful",
      message: "The temporary file(s) has been deleted",
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