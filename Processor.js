const fs = require('fs');
const Watson = require('./Watson');

let service = null;
let mainWindow = null;
let totalFiles = 0;

function setParameters(event, serviceInput, mainWindowInput){
  service = serviceInput;
  mainWindow = mainWindowInput;
}

function processFile(event, filePaths, destPath){
  if(service === null || mainWindow === null){
    console.log("Unexpected Error");
    return;
  }
  console.log("At ProcessFile" + filePaths);
  for(let i = 0; i < filePaths.length; i++) {
    dealDirectory(event, filePaths[i], destPath);
  }
}

function dealDirectory(event, filePath, destPath){
  let fileStats = fs.statSync(filePath);

  if(fileStats.isDirectory()){
    let directoryContents = fs.readdirSync(filePath);
    for(let i = 0; i < directoryContents.length; i++){
      dealDirectory(event, directoryContents[i], destPath);
    }
  }
  else if(fileStats.isFile()){
    totalFiles++;
    let lol = Watson.callWatsonApi([filePath], destPath, mainWindow, event);
    console.log(lol);
  }
}

function displayFile(filePath, mainWindow){
  fs.readFile(filePath, {encoding:'utf-8'}, function(err, data){
    let data_list;
    let final_html = "";
    let data_separated;
    if (!err) {
      data_list = data.toString().split('\n');
      for(var i = 1; i < data_list.length; i++){
        final_html += "<tr>\n"
        data_separated = data_list[i].split(',');
        for(var j = 0; j < data_separated.length; j++){
          final_html += "<td>" + data_separated[j] + "</td>\n";
        }
        final_html += "</tr>\n";
      }
      mainWindow.webContents.on('did-finish-load', ()=> {
        mainWindow.webContents.send('display-data', final_html);
        console.log("sent");
      });
    } else {
      console.log(err)
    }
  })
}

module.exports.processFile = processFile
module.exports.displayFile = displayFile
module.exports.setParameters = setParameters