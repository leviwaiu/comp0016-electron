const fs = require('fs');
const Watson = require('./Watson');
const FileHandler = require('./FileHandler');
const FileType = require('file-type');
const path = require('path');
const commonEmitter = require('./Emitter');
const Utilities = require('./Utilities');
const Settings = require('./Settings');

/***
 * The Processor file provides functions to handle the i/o files and the display of output
 * @var service: String of the Service that would be used in he process
 * @var mainWindow: MainWindow Object of the
 * @var processedLocation: The Path of all the audio files that have been tagged to process
 */

let service = null;
let mainWindow = null;
let processedLocation = [];

/***
 * @var login_options: Options for login
 * @type {null}
 */
let login_options = null;
let destPath_store = null;
let filePaths_store = null;
let inputType = 1; //1 = Single File, 2 = Multiple Files, 3 = Directory


/***
 *  This deletes a file from the array of files tagged.
 * @param file: File to be Removed
 */
function removeFile(file){
  processedLocation = Utilities.removeArray(processedLocation,file);
}

/***
 * Gets the number of files that are being processed
 * @returns {number}
 */
function getFileNumber(){
  return processedLocation.length;
}

function setParameters(serviceInput, mainWindowInput){
  service = serviceInput;
  mainWindow = mainWindowInput;
}

function changeCredentialsApi(apiKey){
  login_options = {
    apikey: apiKey,
  }
}

function getSavedInput(){
  return {
    apiKey: login_options.apikey,
    destPath: destPath_store,
    filePath: filePaths_store,
  }
}

function returnInputType(){
  return inputType;
}

function processFile(event, filePaths, destPath){
  processedLocation = [];

  if(destPath !== null) {
    destPath_store = destPath;
  }
  else{
    destPath = destPath_store;
  }
  if(filePaths !== null) {
    filePaths_store = filePaths;
  } else {
    filePaths = filePaths_store;
  }


  if(service === null || mainWindow === null){
    console.log("Unexpected Error");
    return;
  }
  console.log("At ProcessFile" + filePaths);

  if(filePaths.length > 1 ){
    inputType = 2;
  }


  Watson.setUpWatson(login_options, mainWindow);
  for(let i = 0; i < filePaths.length; i++) {
    let currentSubDir = [];
    handleDirectory(event, filePaths[i], destPath, currentSubDir);
  }

  let completedFiles = 0;
  commonEmitter.commonEmitter.on('oneFileDone',()=>{
    completedFiles++;
    let percentage = (completedFiles / (processedLocation.length + 1)) * 100;
    console.log(percentage);
    mainWindow.webContents.send('update-bar', percentage);
    if(completedFiles === processedLocation.length && Settings.getOtherOptions().deleteData){
      Watson.deleteUserData();
    } else {
      commonEmitter.commonEmitter.emit('allFilesDone');
    }
  });
  commonEmitter.commonEmitter.on('allFilesDone', ()=>{
    mainWindow.webContents.send('update-bar', 100);
    mainWindow.webContents.send('analyse-finish');
  })

}

function handleDirectory(event, filePath, destPath, currentSubDir){
  let fileStats = fs.statSync(filePath);

  if(fileStats.isDirectory()){
    inputType = 3;
    let directoryContents = fs.readdirSync(filePath);
    let newSubDir = [...currentSubDir];
    newSubDir.push(path.basename(filePath));
    for(let i = 0; i < directoryContents.length; i++){
      handleDirectory(event, path.join(filePath, directoryContents[i]), destPath, newSubDir);
    }
  }
  else if(fileStats.isFile()) {
    (async () => {
      let fileTypeObject = (await FileType.fromFile(filePath))
      let fileType = undefined;
      if(fileTypeObject !== undefined){
        fileType = fileTypeObject["ext"];
      }
      console.log(fileType);
      if (fileType === "wav" || fileType === "ogg" || fileType === "mp3" || fileType === "flac") {
        let currentBase = destPath;
        for(let i = 1 ; i < currentSubDir.length; i++){
          currentBase = currentBase.concat(path.sep, currentSubDir[i]);
        }
        processedLocation.push(path.join(currentBase, path.basename(filePath, "." + fileType) + ".csv"));
        console.log(processedLocation);

        //Reserved Ability to Add more STT Services
        if(service === "IBM") {
          await Watson.callWatsonApi(filePath, destPath, currentSubDir);
        }
        else {
          console.log("Unexpected Error");
          return;
        }
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
      mainWindow.webContents.send('display-data', final_html, filePath);
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

  mainWindow.webContents.send('get-all-csv',destPath_store, filteredArray);
}



function deleteAll(){
  for(let i = 0; i < processedLocation.length; i++){
    if(fs.existsSync(processedLocation[i])){
      fs.unlinkSync(processedLocation[i]);
    }
    else {
      mainWindow.webContents.send('file-delete-error', processedLocation[i]);
    }
  }

}


module.exports.processFile = processFile;
module.exports.displayDirectory = displayDirectory;
module.exports.displayFile = displayFile;
module.exports.setParameters = setParameters;
module.exports.changeCredentialsApi = changeCredentialsApi;
module.exports.displayFileSingle = displayFileSingle;
module.exports.returnInputType = returnInputType;
module.exports.displayFileList = displayFileList;
module.exports.removeFile = removeFile;
module.exports.getFileNumber = getFileNumber;
module.exports.getSavedInput = getSavedInput;
module.exports.deleteAll = deleteAll;