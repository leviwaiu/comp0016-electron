'use strict'

const {ipcRenderer} = require('electron');
let i = 0;
let b;

ipcRenderer.on('get-all-csv', (event, filePath) => {
configTable(filePath)});

function configTable(filteredArray) {

  while (i < filteredArray.length) {
    let tableRef = document.getElementById('fileTable').getElementsByTagName('tbody')[0];
    let newRow = tableRef.insertRow(tableRef.rows.length);

      let firstCell = newRow.insertCell(0);
      let firstText = document.createTextNode(i);
      firstCell.appendChild(firstText);
      let secondCell = newRow.insertCell(1);
      let secondText = document.createTextNode(filteredArray[i]);
      secondCell.appendChild(secondText);
      let thirdcell = newRow.insertCell(2);

      let btn0 = document.createElement("BUTTON");
      let viewIdVar = "viewid" + i;

      btn0.setAttribute("class", "btn btn-primary");
      btn0.setAttribute("id", viewIdVar);
      btn0.appendChild(document.createTextNode("View"));

      let btn1 = document.createElement("BUTTON");
      let saveIdVar = "saveid" + i;
      btn1.setAttribute("class", "btn btn-success");
      btn1.setAttribute("id", saveIdVar);
      btn1.appendChild(document.createTextNode("Save"));

      let btn2 = document.createElement("BUTTON");
      let deleteIdVar = "deleteid" + i;
      btn2.setAttribute("class", "btn btn-danger");
      btn2.setAttribute("id", deleteIdVar);
      btn2.appendChild(document.createTextNode("Delete"));
      thirdcell.appendChild(btn0);
      thirdcell.appendChild(btn1);
      thirdcell.appendChild(btn2);

    i++;
  }

  for (b = 0; b < filteredArray.length; b++) {
    var viewid = 'viewid' + b;
    document.getElementById(viewid).addEventListener('click', async (evt) => {
      evt.preventDefault();
      ipcRenderer.send('viewcsv', filteredArray[b - 1]);
    })
    var saveid = 'saveid' + b;
    document.getElementById(saveid).addEventListener('click', async (evt) => {
      evt.preventDefault();
      ipcRenderer.send('savecsv', filteredArray[b - 1]);
    })
    var deleteid = 'deleteid' + b;
    document.getElementById(deleteid).addEventListener('click', async (evt) => {
      evt.preventDefault();
      console.log(b);
      console.log(filteredArray[b] + "deleted");
      ipcRenderer.send('deletecsv', filteredArray[b - 1], b - 1);
    })
  }
}

ipcRenderer.on('deleterow', function (event, nb) {
  document.getElementById('myTable').deleteRow(nb - 1);
})