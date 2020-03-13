'use strict'
window.$ = window.jQuery = require('jquery');
const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;

const path = require('path');

let fileTreeLocal = null;
let fileTree_html = document.getElementById('file-tree');
let processedLocation

ipcRenderer.on('init-dir', function(event, fileTree, destPath, processedLocationParam){
  processedLocation = processedLocationParam;
  fileTreeLocal = fileTree;
  fileTree_html.innerHTML =
    "<a data-toggle='collapse' href='#file-first-div' data-parent='#file-tree' aria-expanded='true'>"+
    "&#x25BA;" +  destPath +
    "</a><div id='file-first-div' class='collapse show dir-display' data-parent='#file-tree'>" +
    "</div>"

  let first_level = document.getElementById('file-first-div');
  let currentLevel = [];
  renderFileTree(currentLevel, first_level, fileTreeLocal, processedLocation);
  refresh_divs();
})

function renderFileTree(currentLevels, currentDiv ,fileTree, processedLocation){

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

      insertText +=
        "<li>" +
        "<a data-toggle='collapse' class='collapsed file-title' href='#files"+ currentDirectory +"'>"+
        "&#x25BA;" + path.basename(currentFile.path) +
        "</a>" +
        "</li>";

      insertText +=
        "<div id='files"+ currentDirectory + "' class='collapse dir-display'>" +
        "</div>"

      currentUl.innerHTML += insertText;
    }
    else {
      for(let j = 0; j < processedLocation.length; j++) {
        if (processedLocation[j] === currentFile.path) {
          insertText += "<li class='selectable-file'>" + path.basename(currentFile.path) +
            "<div class='d-none flex-row-reverse file-buttons'>" +
            "<button class='btn btn-warning delete-buttons' data-path='" +
            currentFile.path
            + "'>Delete</button>" +
            "<button class='btn btn-primary view-buttons' data-path='" +
            currentFile.path
            +"'>View</button></div>" +
            "</li>"
          break;
        }
        else if(j === processedLocation.length - 1){
          insertText += "<li>" + path.basename(currentFile.path) + "</li>"
        }
      }
      currentUl.innerHTML += insertText;
    }
  }
}

function renderMoreLevels(event){

    console.log(event.target.innerHTML);

    let id = event.target.href.split("#")[1];
    console.log(id);
    let id_array = id.split("-");
    let currentFileTreeLevel = fileTreeLocal;
    id_array.shift()
    for (let i = 0; i < id_array.length; i++) {
      let index = id_array[i];
      currentFileTreeLevel = currentFileTreeLevel[index].items
      console.log(currentFileTreeLevel);
    }

    let targetDiv = document.getElementById(id);

    if(targetDiv.innerHTML === ""){
      renderFileTree(id_array, targetDiv, currentFileTreeLevel, processedLocation);
      refresh_divs();
    }

  if(targetDiv.classList.contains("show")){
    event.target.innerHTML = event.target.innerHTML.replace("▼", "►");
  }
  else{
    event.target.innerHTML = event.target.innerHTML.replace("►", "▼");
  }

}

function refresh_divs(){

  let numbersOfDirs = document.getElementsByClassName('file-title');
  for(let i = 0; i < numbersOfDirs.length; i++){
    numbersOfDirs[i].addEventListener('click', (event)=>{renderMoreLevels(event)});
  }

  let targetFiles = document.getElementsByClassName('selectable-file');
  for(let i = 0; i < targetFiles.length; i++){
    targetFiles[i].addEventListener('click', (event) =>{toggleFileButtons(event)});
  }

  let viewButtons = document.getElementsByClassName('view-buttons');
  for(let i = 0; i < viewButtons.length; i++){
    viewButtons[i].addEventListener('click', (event) => {openFiles(event)});
  }

  let deleteButtons = document.getElementsByClassName('delete-buttons');
  for(let i = 0; i < deleteButtons.length; i++){
    deleteButtons[i].addEventListener('click', (event) =>{deleteFiles(event)});
  }
}

function toggleFileButtons(event){
  let originalShow = document.getElementsByClassName('file-selected');
  if(originalShow.length > 0) {
    originalShow[0].getElementsByTagName('div')[0].classList.add('d-none');
    originalShow[0].getElementsByTagName('div')[0].classList.remove('d-flex');
    originalShow[0].classList.remove('file-selected');
  }

  let buttons = event.target.getElementsByTagName('div');
  buttons[0].classList.remove('d-none');
  buttons[0].classList.add('d-flex');
  event.target.classList.add('file-selected');

}

function openFiles(event){
  event.stopPropagation();
  let idea = event.target.dataset.path;
  console.log(idea);
  ipcRenderer.send('viewcsv', idea.toString());
}

function deleteFiles(event){
  event.stopPropagation();
  let file = event.target.dataset.path;
  ipcRenderer.send('delete-file', file.toString());
}

document.getElementById('return-button').addEventListener('click', (evt)=>{
    evt.preventDefault();
    ipcRenderer.send('return-to-login');
})



document.getElementById('delete-all-button').addEventListener('click', () => {
  ipcRenderer.send('delete-all');
})