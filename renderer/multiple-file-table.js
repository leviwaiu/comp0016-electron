'use strict'

const {ipcRenderer} = require('electron');
const path = require('path');
let i = 0;
let b;
let destPath;

ipcRenderer.on('get-all-csv', (event, destPath_store, filePaths) => {
  destPath = destPath_store;
  configTable(filePaths);
});

function configTable(filteredArray) {

  while (i < filteredArray.length) {
    let tableRef = document.getElementById('fileTable').getElementsByTagName('tbody')[0];
    let newRow = tableRef.insertRow(tableRef.rows.length);

      let firstCell = newRow.insertCell(0);
      let firstText = document.createTextNode(i.toString());
      firstCell.appendChild(firstText);
      let secondCell = newRow.insertCell(1);
      let secondText = document.createTextNode(filteredArray[i]);
      secondCell.appendChild(secondText);
      let thirdcell = newRow.insertCell(2);

      let btn0 = document.createElement("BUTTON");
      let viewIdVar = "viewid-" + i;

      btn0.setAttribute("class", "btn btn-primary");
      btn0.setAttribute("id", viewIdVar);
      btn0.appendChild(document.createTextNode("View"));

      let btn2 = document.createElement("BUTTON");
      let deleteIdVar = "deleteid-" + i;
      btn2.setAttribute("class", "btn btn-warning");
      btn2.setAttribute("id", deleteIdVar);
      btn2.appendChild(document.createTextNode("Delete"));
      thirdcell.appendChild(btn0);
      thirdcell.appendChild(btn2);

    i++;
  }

  for (b = 0; b < filteredArray.length; b++) {
    let viewid = 'viewid-' + b;
    document.getElementById(viewid).addEventListener('click', async (evt) => {
      evt.preventDefault();
      let number = evt.target.id.split("-")[1];
      ipcRenderer.send('viewcsv', path.join(destPath, filteredArray[number]));
    })
    let deleteid = 'deleteid-' + b;
    document.getElementById(deleteid).addEventListener('click', async (evt) => {
      evt.preventDefault();
      let number = evt.target.id.split("-")[1];
      console.log(filteredArray[number]);
      ipcRenderer.send('delete-file', path.join(destPath, filteredArray[number]), number);
    })
  }
}

ipcRenderer.on('delete-row', function (event, nb) {
  console.log("Poi");
  document.getElementById('fileTable').deleteRow(nb);
})

document.getElementById('delete-all-button').addEventListener('click', () => {
  ipcRenderer.send('delete-all');
})

document.getElementById('return-button').addEventListener('click', (evt)=>{
  evt.preventDefault();
  ipcRenderer.send('return-to-login');
})
