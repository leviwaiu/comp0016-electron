const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const fs = require('fs')
const path = require('path')
const FileType = require('file-type');
const common = require('./Emitter')
const commonEmitter = common.commonEmitter

let chosenApiKey = '';

let speechToText = null;
let fileExtension = null;

let params = {
  objectMode: true,
  contentType: 'audio/wav',
  model: 'en-GB_NarrowbandModel',
  speakerLabels: true,
  timestamps: true,
  wordConfidence: true,
}

function setOptions(newParams){
  Object.keys(newParams).forEach(function(key){
    if(params.hasOwnProperty(key)){
      params[key] = newParams[key];
    }
  })
  console.log(params);
}

function getOptions(){
  return params;
}

async function callWatsonAPI (process_files, destPath, mainWindow, login_options) {

  speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({...login_options}),
    url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
    headers: {
    'X-Watson-Learning-Opt-Out': 'true',
  },
  })

  mainWindow.webContents.send('log-data', "Initialising IBM Watson");
  let recogniseStream = speechToText.recognizeUsingWebSocket(params);
  mainWindow.webContents.send('log-data', "IBM Watson Initialised");
    fileExtension = (await FileType.fromFile(process_files))["ext"];

    params["contentType"] = "audio/" + fileExtension;

    mainWindow.webContents.send('log-data', "A " + fileExtension + " file has been recognised");
    fs.createReadStream(process_files).pipe(recogniseStream)

    recogniseStream.on('data', function (event) {
      processResult(event, process_files, destPath);
      mainWindow.webContents.send('log-data', "Transcription for file "+ process_files +" complete");
      commonEmitter.emit('oneFileDone');
    })
    recogniseStream.on('error', function (event) {
      onEvent('Error:', event);
      mainWindow.webContents.send('log-data', JSON.stringify(event));
    })
    recogniseStream.on('close', function (event) {
      onEvent('Close:', event);
      mainWindow.webContents.send('analyse-finish');
    })
  commonEmitter.on('stop', () => {
    console.log('stop')
    recogniseStream.stop();
    recogniseStream.end()
    recogniseStream.removeAllListeners();
    recogniseStream.destroy();
  })
}


function processResult (event, documentPath, destPath) {
  const speakerLabels = event['speaker_labels'];
  const documentPathBase = path.basename(documentPath, "." + fileExtension);

  let stream = fs.createWriteStream(destPath + path.sep + documentPathBase + '.csv')
  let timeBetween = 0.00
  let previousSpeaker = 0
  let previousEnd = 0.00
  let titleString = "TimeFrom,TimeTo,Speaker,Gap between speakers,Confidence\n";
  stream.write(titleString);

  for (let i = 0; i < speakerLabels.length; i++) {
    const item = speakerLabels[i]
    if (item['speaker'] !== previousSpeaker) {
      timeBetween = (item['from'] - previousEnd).toFixed(2)
      previousSpeaker = item['speaker']
    }
    let writeString = item['from'] + ',' + item['to'] + ',' + item['speaker'] + ',' + timeBetween + ',' + item['confidence'] + '\n'
    previousEnd = item['to']
    stream.write(writeString)
  }
  stream.end()
}

function onEvent (name, event) {
  console.log(name, JSON.stringify(event, null, 2))
}

module.exports.getOptions = getOptions;
module.exports.setOptions = setOptions;
module.exports.callWatsonApi = callWatsonAPI