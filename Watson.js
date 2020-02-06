const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const {IamAuthenticator} = require('ibm-watson/auth');
const fs = require('fs');

let chosenUsername = "";
let chosenPassword = "";
let chosenApiKey;

let usesApi = true;

let speechToText = null;

let params = {
  objectMode: true,
  contentType: 'audio/wav',
  model:'en-GB_NarrowbandModel',
  speakerLabels:true,
  timestamps:true,
  wordConfidence:true,
};

function setParams(contentType, model){
  params["contentType"] = contentType;
  params["model"] = model;
}

function setUserPass(username_input, password_input){
   chosenUsername = username_input;
   chosenPassword = password_input;
}

function setApiKey(api_input){
  chosenApiKey = api_input;
}

function callWatsonAPI(usesApi, process_files) {

  let threshold = 60.0;

  if(!usesApi) {
    speechToText = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        username: chosenUsername,
        password: chosenPassword
      }),
      url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
      headers: {
        'X-Watson-Learning-Opt-Out': 'true',
      },
    });
  } else {
    TranscribeDetails["speechToText"] = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        apikey: chosenApiKey,
      }),
      url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
      headers: {
        'X-Watson-Learning-Opt-Out': 'true',
      },
    })
  }

  let recogniseStream = TranscribeDetails.recognizeUsingWebSocket(params);

  fs.createReadStream('sample.sav').pipe(recogniseStream);
  recogniseStream.on('data', function(event) {onEvent("Data:", event); });
  recogniseStream.on('error', function(event) {onEvent("Error:", event); });
  recogniseStream.on('close', function(event) {onEvent('Close:', event); });
  //Try to transcribe it into a new audio Thread(i.e. working it into the IBM system)

}


function onEvent(name, event){
  console.log(name, JSON.stringify(event, null, 2));
}
