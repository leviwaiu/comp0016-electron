'use strict'

const {ipcRenderer} = require('electron');
const path = require('path');
const {dialog, BrowserWindow} = require('electron').remote;

let file;
let newWindow;
let types = [
 {name: 'Audio', extensions: ['m4a', 'flac', 'mp4', 'mp3', 'wav']},];

 let options = {filters:types, properties:['openFile', 'multiSelections'] }

document.getElementById('file-select').addEventListener('click', async (evt) => {
  evt.preventDefault();
  const file_promise = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options);
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
document.getElementById('credentials-button').addEventListener('click', () =>{
  newWindow = new BrowserWindow( {
    height:300,
    width:500
  });
  newWindow.loadFile(path.join('renderer', 'credentials.html'))
})
ipcRenderer.on('close-credentials', function(){
  console.log("here");
  newWindow.close();
})