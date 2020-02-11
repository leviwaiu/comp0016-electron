const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const {IamAuthenticator} = require('ibm-watson/auth');
const fs = require('fs');

const apiKey = require('./apiKeys');
const speechToText = new SpeechToTextV1 ({
  authenticator: new IamAuthenticator({
    apikey:apiKey.IBMKey,
  }),
  url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com',
  headers: {
    'X-Watson-Learning-Opt-Out': 'true'
  }
});

var params = {
  objectMode: true,
  contentType: 'audio/wav',
  model: 'en-GB_NarrowbandModel',
  speakerLabels: true,
  timestamps: true,
  wordConfidence: true,
};

var recognizeStream = speechToText.recognizeUsingWebSocket(params);

function watson_Test() {
  fs.createReadStream('sample.wav').pipe(recognizeStream);

  recognizeStream.on('data', function (event) {onEvent('Data:', event); });
  recognizeStream.on('error', function (event) {onEvent('Error:', event); });
  recognizeStream.on('close', function (event) {onEvent('Close:', event); });
}

function onEvent(name, event){
  console.log(name, JSON.stringify(event["speaker_labels"], null, 2));
}

module.exports.watson_Test = watson_Test;