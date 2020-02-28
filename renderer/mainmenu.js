'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
let file;
let newWindow;
let types = [
  {name: 'Audio', extensions: ['m4a', 'flac', 'mp4', 'mp3', 'wav']},];

let filePromise = [];
let saveDirPromise;

const fileShowField = document.getElementById('filename');

document.getElementById('file-select').addEventListener('click', async (evt) => {
  evt.preventDefault();
  filePromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    { title:"Choose File or Directory",
      filters:types,
      properties: ['openFile', 'multiSelections']});
  console.log(filePromise);
  if(filePromise === undefined){
    fileShowField.innerText = "No file or directory specified.";
  }
  file = filePromise.filePaths[0];
    if (filePromise.filePaths.length > 1) {
      fileShowField.innerText = "Multiple files selected.";
    } else {
      fileShowField.innerText = file;
    }
})

document.getElementById('directory-select').addEventListener("click", async(evt)=>{
  evt.preventDefault();
  filePromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    {title:"Choose Directory",
    properties:['openDirectory']});
  if(filePromise === undefined){
     fileShowField.innerText = "No file or directory specified."
  } else {
    document.getElementById('filename').innerText = filePromise.filePaths[0];
  }
});

document.getElementById('destination-button').addEventListener("click", async (evt) => {
  evt.preventDefault();
  saveDirPromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    { title:"Choose Directory",
              properties:['openDirectory']}
              );
  document.getElementById('destination-show').innerText = saveDirPromise.filePaths[0];
})

document.getElementById('analyse-button').addEventListener('click', (evt) => {
  evt.preventDefault();
  const service = document.getElementById('service-select').value;
  const apiKey = document.getElementById('api-key').value;
  console.log(filePromise.filePaths);
  ipcRenderer.send('analyse-form-submission', service, filePromise.filePaths, saveDirPromise.filePaths[0], apiKey);
})

document.getElementById('show-api-key').addEventListener('click', ()=>{
  let currentState = document.getElementById('api-key');
  if(currentState.type === 'text'){
    currentState.type = 'password';
  } else {
    currentState.type = 'text';
  }
})

document.getElementById("logout-button").addEventListener('click', (evt) => {
  evt.preventDefault();
  ipcRenderer.send('logout');
})

document.getElementById('credentials-button').addEventListener('click', (evt) =>{
  evt.preventDefault();
  ipcRenderer.send('open-credentials');
})
ipcRenderer.on('close-credentials', () =>{
  //console.log("here");
  newWindow.close();
})