'use strict'
window.$ = window.jQuery = require('jquery');
const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;

const fs = require('fs');
const path = require('path');

let fileTreeLocal = null;
let fileTree_html = document.getElementById('file-tree');

ipcRenderer.on('init-dir', function(event, fileTree, destPath){
  fileTreeLocal = fileTree;
  fileTree_html.innerHTML =
    "&#x25BA;<a data-toggle='collapse' href='#file-first-div' data-parent='#file-tree' aria-expanded='true'>"+ destPath +
    "</a><div id='file-first-div' class='collapse show dir-display' data-parent='#file-tree'></div>"
  let first_level = document.getElementById('file-first-div');
  let currentLevel = [];
  renderFileTree(currentLevel, first_level, fileTreeLocal);
  let numbersOfDirs = document.getElementsByClassName('file-title');
  for(let i = 0; i < numbersOfDirs.length; i++){
    numbersOfDirs[i].addEventListener('click', (event)=>{renderMoreLevels(event)});
  }
})

function renderFileTree(currentLevels, currentDiv ,fileTree){

  currentDiv.innerHTML += "<ul class='list-unstyled' id='ul-"+currentDiv.id+"'></ul>"

  let currentUl = document.getElementById("ul-" + currentDiv.id);

  for(let i = 0; i < fileTree.length; i++){
    let nextLevels = [...currentLevels, i];
    let currentFile = fileTree[i];
    let insertText = "";

    if(currentFile.items.length > 0){
      let currentDirectory = "";
      for(let j = 0; j < nextLevels.length; j++){
        currentDirectory += "-" + nextLevels[j];
      }

      insertText += "<li>&#x25BA;<a data-toggle='collapse' class='collapsed file-title' href='#files"+ currentDirectory +"'>"+ path.basename(currentFile.path) +
      "</a></li>";
      insertText += "<div id='files"+ currentDirectory + "' class='collapse dir-display'></div>"
      currentUl.innerHTML += insertText;
      let nextLevelUl = document.getElementById("files" + currentDirectory);
      if(currentLevels.length < 3) {
        renderFileTree(nextLevels, nextLevelUl, currentFile.items);
      }
    }
    else {
      insertText += "<li>" + path.basename(currentFile.path) + "</li>"
      currentUl.innerHTML += insertText;
    }
  }
}

function renderMoreLevels(event){
  let id = event.target.href.split("#")[1];
  let targetDiv = document.getElementById(id);
}

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

ipcRenderer.on('deleterow', function(event, nb){
  document.getElementById('myTable').deleteRow(nb-1);
});

ipcRenderer.on('file-delete-error', async function(){
  await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "info",
    title: "Delete Failed",
    message: "Delete Failed",
    detail: "Something went wrong when deleting the temporary form",
    buttons:["OK"]
  })
})

