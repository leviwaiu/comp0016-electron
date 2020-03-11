const fs = require('fs');
const Watson = require('./Watson');
const FileHandler = require('./FileHandler');
const FileType = require('file-type');
const path = require('path');
const commonEmitter = require('./Emitter');

let service = null;
let mainWindow = null;
let processedLocation = [];

let login_options = null;
let destPath_store = null;
let inputType = 1; //1 = Single File, 2 = Multiple Files, 3 = Directory

function setParameters(serviceInput, mainWindowInput){
  service = serviceInput;
  mainWindow = mainWindowInput;
}

function changeOptions(results){
  Watson.setOptions(results);
}

function getOptions(){
  return Watson.getOptions();
}

function changeCredentialsApi(apiKey){
  login_options = {
    apikey: apiKey,
  }
}

function returnInputType(){
  return inputType;
}

function processFile(event, filePaths, destPath){
  processedLocation = [];
  destPath_store = destPath;
  if(service === null || mainWindow === null){
    console.log("Unexpected Error");
    return;
  }
  console.log("At ProcessFile" + filePaths);

  if(filePaths.length > 1 ){
    inputType = 2;
  }

  for(let i = 0; i < filePaths.length; i++) {
    handleDirectory(event, filePaths[i], destPath);
  }
}

function handleDirectory(event, filePath, destPath){
  let fileStats = fs.statSync(filePath);
  let completedFiles = 0;

  commonEmitter.commonEmitter.on('oneFileDone',()=>{
    completedFiles++;
    let percentage = (completedFiles / processedLocation.length) * 100;
    console.log(percentage);
    mainWindow.webContents.send('update-bar', percentage);
  });

  if(fileStats.isDirectory()){
    inputType = 3;
    let directoryContents = fs.readdirSync(filePath);
    for(let i = 0; i < directoryContents.length; i++){
      handleDirectory(event, path.join(filePath, directoryContents[i]), destPath);
    }
  }
  else if(fileStats.isFile()) {
    (async () => {
      let fileType = (await FileType.fromFile(filePath))["ext"];
      console.log(fileType);
      if (fileType === "wav" || fileType === "ogg" || fileType === "mp3" || fileType === "flac") {
        processedLocation.push(path.join(destPath, path.basename(filePath, "." + fileType) + ".csv"));
        console.log(processedLocation);
        await Watson.callWatsonApi(filePath, destPath, mainWindow, login_options);
      }
    })();
  }
}


function displayDirectory(){
  let fileTree = FileHandler.readDir(destPath_store);
  console.log(FileHandler.readDir(destPath_store));

  mainWindow.webContents.send('init-dir', fileTree, destPath_store, processedLocation);
}

function displayFileSingle(){
  displayFile(processedLocation[0]);
}

function displayFile(filePath){
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
      mainWindow.webContents.send('display-data', final_html);
      console.log("sent");
    } else {
      console.log(err)
    }
  })
}

function displayFileList(){

  let files1 = null;
  let filteredArray = [];

  try {
    files1 = fs.readdirSync(destPath_store);
    let textToSearch = '.csv';
    filteredArray = files1.filter((str) => {
      return str.toLowerCase().indexOf(textToSearch.toLowerCase()) >= 0;
    });
    console.log(filteredArray);
    console.log(filteredArray[0]);
  } catch (err) {
    // An error occurred
    console.error(err);
  }

  mainWindow.webContents.send('get-all-csv', filteredArray);
}

module.exports.processFile = processFile;
module.exports.displayDirectory = displayDirectory;
module.exports.displayFile = displayFile;
module.exports.setParameters = setParameters;
module.exports.changeOptions = changeOptions;
module.exports.getOptions = getOptions;
module.exports.changeCredentialsApi = changeCredentialsApi;
module.exports.displayFileSingle = displayFileSingle;
module.exports.returnInputType = returnInputType;
module.exports.displayFileList = displayFileList;