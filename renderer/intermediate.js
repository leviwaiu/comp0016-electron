'use strict'

const {ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
let files = [];
const fs = require('fs')
let i = 0;
let a;
let b;
let files1;
let filteredArray;

try {
  files1 = fs.readdirSync('./');
  var textToSearch = '.csv';
  filteredArray = files1.filter((str)=>{
  return str.toLowerCase().indexOf(textToSearch.toLowerCase()) >= 0;
   });
  console.log(filteredArray);
  console.log(filteredArray[0]);
} catch(err) {
  // An error occurred
  console.error(err);
}

while(i<filteredArray.length){
  var tableRef = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  var newRow = tableRef.insertRow(tableRef.rows.length);

  for(a=0; a <= 2; a++){

    if(a==0){
      var firstCell = newRow.insertCell(0);
      var firstText = document.createTextNode(i);
      firstCell.appendChild(firstText);
    }
    if(a==1){
      var secondCell = newRow.insertCell(1);
      var secondText = document.createTextNode(filteredArray[i]);
      secondCell.appendChild(secondText);
    }
    if(a==2){
      var thirdcell = newRow.insertCell(2);
      var btn0 = document.createElement("BUTTON");
      let viewIdVar = "viewid"+i;
      btn0.setAttribute("class", "btn btn-primary");
      btn0.setAttribute("id", viewIdVar);
      btn0.appendChild(document.createTextNode("View"));


      var btn1 = document.createElement("BUTTON");
      let saveIdVar = "saveid"+i;
      btn1.setAttribute("class", "btn btn-success");
      btn1.setAttribute("id", saveIdVar);
      btn1.appendChild(document.createTextNode("Save"));


      var btn2 = document.createElement("BUTTON");
      let deleteIdVar = "deleteid"+i;
      btn2.setAttribute("class", "btn btn-danger");
      btn2.setAttribute("id", deleteIdVar);
      btn2.appendChild(document.createTextNode("Delete"));
      thirdcell.appendChild(btn0);
      thirdcell.appendChild(btn1);
      thirdcell.appendChild(btn2);
    }
  }
  i++;
}

for(b = 0; b<filteredArray.length;b++){
  var viewid = 'viewid'+b;
  document.getElementById(viewid).addEventListener('click', async(evt) => {
    evt.preventDefault();
    ipcRenderer.send('viewcsv', filteredArray[b-1]);
  })
  var saveid = 'saveid'+b;
  document.getElementById(saveid).addEventListener('click', async(evt) =>{
    evt.preventDefault();
    ipcRenderer.send('savecsv', filteredArray[b-1]);
  })

  var deleteid = 'deleteid'+b;
  document.getElementById(deleteid).addEventListener('click', async(evt) => {
    evt.preventDefault();
    console.log(b);
    console.log(filteredArray[b] + "deleted");
    ipcRenderer.send('deletecsv', filteredArray[b-1], b-1);
  })
}

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

