/**const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const {IamAuthenticator} = require('ibm-watson/auth');


const TranscribeDetails = {
  file_name: null,
  options: null, //Builder(),apiKey("InsertApiKeyHere").build(),
  speechToText:new SpeechToTextV1({
    authenticator: null,
    //URL set to be
    url: ''
  }),
  threshold:60.0,
};


class TranscribeAudioThread{
  constructor({...TranscribeDetails}){

  }
}

function callWatsonAPI(username_input, password_input, process_files) {

  let chosenUsername;
  let chosenPassword;

  //For Dev Purposes Only at this moment
  if(username_input !== ""){
      chosenUsername = "";
  }
  if(password_input !== ""){
    chosenPassword = "";
  }

  let threshold = 60.0;

  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      username: chosenUsername,
      password: chosenPassword
    }),
    url: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com'
  });

  const progStart = (new Date()).getTime();

  //Try to transcribe it into a new audio Thread(i.e. working it into the IBM system)
  try{
    for(var file in process_files){
        thread = {

        }
    }
  }

}**/