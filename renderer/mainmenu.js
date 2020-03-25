'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
let file = [];
let saveDir;
let newWindow;
let types = [
  {name: 'Audio', extensions: ['m4a', 'flac', 'mp4', 'mp3', 'wav']},];


const fileShowField = document.getElementById('filename');
const destShowField = document.getElementById('destination-show');
const apiKeyField = document.getElementById('api-key');

document.getElementById('file-select').addEventListener('click', async (evt) => {
  evt.preventDefault();
  let filePromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    { title:"Choose File or Directory",
      filters:types,
      properties: ['openFile', 'multiSelections']});
  console.log(filePromise);
  if(filePromise === undefined){
    fileShowField.innerText = "No file or directory specified.";
  }
  file = filePromise.filePaths;
    if (filePromise.filePaths.length > 1) {
      fileShowField.innerText = "Multiple files selected.";
    } else {
      fileShowField.innerText = filePromise.filePaths[0];
    }
})

document.getElementById('directory-select').addEventListener("click", async(evt)=>{
  evt.preventDefault();
  let filePromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    {title:"Choose Directory",
    properties:['openDirectory']});
  file = filePromise.filePaths;
  if(filePromise === undefined){
     fileShowField.innerText = "No file or directory specified."
  } else {
    fileShowField.innerText = filePromise.filePaths[0];
  }
});

document.getElementById('destination-button').addEventListener("click", async (evt) => {
  evt.preventDefault();
  let saveDirPromise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
    { title:"Choose Directory",
              properties:['openDirectory']}
              );
  saveDir = saveDirPromise.filePaths[0];
  destShowField.innerText = saveDir;
})

document.getElementById('analyse-button').addEventListener('click', (evt) => {
  evt.preventDefault();
  const service = document.getElementById('service-select').value;
  const apiKey = document.getElementById('api-key').value;
  ipcRenderer.send('analyse-form-submission', service, file, saveDir, apiKey);
})

document.getElementById('show-api-key').addEventListener('click', ()=>{
  let currentState = document.getElementById('api-key');
  if(currentState.type === 'text'){
    currentState.type = 'password';
    currentState.innerText = 'Show';
  } else {
    currentState.type = 'text';
    currentState.innerText = 'Hide';
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

ipcRenderer.on('restore-input', (event, savedInput) =>{
  file = savedInput.filePath;
  if(file.length > 1){
    fileShowField.innerText = "Multiple Files Selected";
  }
  else{
    fileShowField.innerText = file[0];
  }
  saveDir = savedInput.destPath;
  destShowField.innerText = saveDir;
  apiKeyField.value = savedInput.apiKey;
})