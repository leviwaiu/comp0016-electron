'use strict'

const {ipcRenderer} = require('electron');
const path = require('path');
const {dialog, BrowserWindow} = require('electron').remote;
let file;
let newWindow;
var file_promise = [];

document.getElementById('file-select').addEventListener('click', async (evt) => {
  evt.preventDefault();
  file_promise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openFile', 'multiSelections']});
  file = file_promise.filePaths[0];
  if(file_promise.filePaths.length > 1){
    document.getElementById('filename').innerText = "Multiple files selected.";
  }
  else{
    document.getElementById('filename').innerText = file;
  }

})
document.getElementById('analyse-button').addEventListener('click', (evt) => {
  evt.preventDefault();
  const service = document.getElementById('service-select').value
  console.log(file_promise.filePaths);
  ipcRenderer.send('analyse-form-submission', service, file_promise.filePaths);
})
document.getElementById("logout-button").addEventListener('click', (evt) => {
  evt.preventDefault();
  ipcRenderer.send('logout');
})
document.getElementById('credentials-button').addEventListener('click', () =>{
  newWindow = new BrowserWindow( {
    height:300,
    width:500,
    show:false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  newWindow.loadFile(path.join('renderer', 'credentials.html'))
  newWindow.once('ready-to-show', ()=> {
    newWindow.show();
  })
})
ipcRenderer.on('close-credentials', function(){
  console.log("here");
  newWindow.close();
})