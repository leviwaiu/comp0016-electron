const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const fs = require('fs')
const path = require('path')
const FileType = require('file-type');

let chosenUsername = ''
let chosenPassword = ''
let chosenApiKey = '';

let speechToText = null;
let fileExtension = [];

let params = {
  objectMode: true,
  contentType: 'audio/wav',
  model: 'en-GB_NarrowbandModel',
  speakerLabels: true,
  timestamps: true,
  wordConfidence: true,
}

function setParams (contentType, model) {
  params['contentType'] = contentType
  params['model'] = model
}

function setUserPass (username_input, password_input) {
  chosenUsername = username_input
  chosenPassword = password_input
}

function setApiKey (api_input) {
  chosenApiKey = api_input
}

async function callWatsonAPI (usesApi, process_files, mainWindow) {

  if (!usesApi) {
    speechToText = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        username: chosenUsername,
        password: chosenPassword
      }),
      url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
      headers: {
        'X-Watson-Learning-Opt-Out': 'true',
      },
    })
  } else {
    speechToText = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        apikey: chosenApiKey,
      }),
      url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
      headers: {
        'X-Watson-Learning-Opt-Out': 'true',
      },
    })
  }

  let recogniseStream = speechToText.recognizeUsingWebSocket(params)

  for (let i = 0; i < process_files.length; i++) {

    fileExtension[i] = (await FileType.fromFile(process_files[i]))["ext"];

    params["contentType"] = "audio/" + fileExtension[i];

    fs.createReadStream(process_files[i]).pipe(recogniseStream)

    recogniseStream.on('data', function (event) {
      onEvent('Data:', event)
      processResult(event, process_files[i])
    })
    recogniseStream.on('error', function (event) {
      onEvent('Error:', event);
      mainWindow.webContents.send('log-data', JSON.stringify(event));
    })
    recogniseStream.on('close', function (event) {
      onEvent('Close:', event);
      mainWindow.webContents.send('analyse-finish');
    })
  }
}



function processResult (event, documentPath) {
  const speakerLabels = event['speaker_labels'];
  const documentPathBase = path.basename(documentPath, "." + fileExtension[0]);

  let stream = fs.createWriteStream(documentPathBase + '.csv')
  let timeBetween = 0.00
  let previousSpeaker = 0
  let previousEnd = 0.00
  let titleString = "TimeFrom,TimeTo,Speaker,Gap between speakers,Confidence\n";
  stream.write(titleString);

  for (let i = 0; i < speakerLabels.length; i++) {
    const item = speakerLabels[i]
    console.log(JSON.stringify(item))
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

module.exports.callWatsonApi = callWatsonAPI