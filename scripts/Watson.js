const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const fs = require('fs')
const path = require('path')
const FileType = require('file-type');
const Settings = require('./Settings');
const common = require('./Emitter')
const commonEmitter = common.commonEmitter

let speechToText = null;
let fileExtension = null;
let mainWindow = null;

let params = {
  objectMode: true,
  contentType: 'audio/wav',
  model: 'en-GB_NarrowbandModel',
  speakerLabels: true,
  timestamps: true,
}

function setOptions(){
  let newParams = Settings.getWatsonOptions();
  Object.keys(newParams).forEach(function(key){
    if(params.hasOwnProperty(key)){
      params[key] = newParams[key];
    }
  })
}

function setUpWatson(login_options, window){
  mainWindow = window;
  mainWindow.webContents.send('log-data', "Initialising IBM Watson");
  speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({...login_options}),
    url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
    headers: {
      'X-Watson-Learning-Opt-Out': 'true',
      'X-Watson-Metadata': 'customer_id=customer',
    },
  })
  mainWindow.webContents.send('log-data', "IBM Watson Options Initialised");
}

async function callWatsonAPI (process_files, destPath, subDir) {

  let recogniseStream = speechToText.recognizeUsingWebSocket(params);

      fileExtension = (await FileType.fromFile(process_files))["ext"];

      params["contentType"] = "audio/" + fileExtension;

      mainWindow.webContents.send('log-data', "A " + fileExtension + " file has been recognised");
      fs.createReadStream(process_files).pipe(recogniseStream)

    recogniseStream.on('data', function (event) {
      processResult(event, process_files, destPath, subDir);
      mainWindow.webContents.send('log-data', "Transcription for file "+ process_files +" complete");
      commonEmitter.emit('oneFileDone');
    })
    recogniseStream.on('error', function (event) {
      onEvent('Error:', event);
      mainWindow.webContents.send('log-data', "ERROR:" + event.message);
      //Specific Error Handling
      if(event.code >= 400 || event.statusText === "ENOTFOUND"){
        commonEmitter.emit('watson-error', event);
      }
      if(event.message === "Session timed out."){
        event.statusText = "Timed Out";
        commonEmitter.emit('watson-error', event);
      }
    })
    recogniseStream.on('close', function (event) {
      onEvent('Close:', event);
    })
  commonEmitter.on('stop', () => {
    console.log('stop')
    recogniseStream.stop();
    recogniseStream.end()
    recogniseStream.removeAllListeners();
    recogniseStream.destroy();
  })
}

function deleteUserData(){
  const extraOptions = Settings.getOtherOptions();
  if(extraOptions.deleteData){
    const deleteUserDataParams = {
      customerId: 'customer'
    };
    speechToText.deleteUserData(deleteUserDataParams).then(
      result =>{
        mainWindow.webContents.send('log-data', 'User data has been deleted');
        commonEmitter.emit("allFilesDone");
      }
    ).catch(error => {
      console.log('error:', error);
    })
  }
}


function processResult (event, documentPath, destPath, subDir) {
  const speakerLabels = event['speaker_labels'];
  const documentPathBase = path.basename(documentPath, "." + fileExtension);
  const extraOptions = Settings.getOtherOptions();

  let subDestPath = destPath;
  for(let i = 1; i < subDir.length; i++){
    subDestPath = subDestPath.concat(path.sep, subDir[i]);
  }

  if(!fs.existsSync(subDestPath)){
    fs.mkdirSync(subDestPath)
  }

  let stream = fs.createWriteStream(subDestPath + path.sep + documentPathBase + '.csv')
  let timeBetween = 0.00
  let previousSpeaker = 0
  let previousEnd = 0.00
  let titleString = "TimeFrom,TimeTo,Speaker";
  if(extraOptions.gapSpeaker){
    titleString += ",Gap between speakers";
  }
  if(extraOptions.speakerConfidence){
    titleString += ",Confidence";
  }
  titleString += "\n";
  stream.write(titleString);

  for (let i = 0; i < speakerLabels.length; i++) {
    const item = speakerLabels[i]
    let writeString = item['from'] + ',' + item['to'] + ',' + item['speaker'];

    if(extraOptions.gapSpeaker) {
      if (item['speaker'] !== previousSpeaker) {
        timeBetween = (item['from'] - previousEnd).toFixed(2)
        previousSpeaker = item['speaker']
      }
      writeString += ',' + timeBetween;
      previousEnd = item['to']
    }

    if(extraOptions.speakerConfidence){
      writeString += ',' + item['confidence'];
    }

    writeString += "\n";
    stream.write(writeString)
  }
  stream.end()
}

function onEvent (name, event) {
  console.log(name, JSON.stringify(event, null, 2))
}

module.exports.setOptions = setOptions;
module.exports.setUpWatson = setUpWatson;
module.exports.deleteUserData = deleteUserData;
module.exports.callWatsonApi = callWatsonAPI