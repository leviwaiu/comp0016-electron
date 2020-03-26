'use strict'

let watsonOptions = {
  model: 'en-GB_NarrowbandModel',
};
let otherOptions = {
  gapSpeaker: true,
  speakerConfidence: true,
  deleteData: true
};

function setWatsonOptions(options){
  watsonOptions = options;
}

function setOtherOptions(options){
  otherOptions = options;
}

function getWatsonOptions(){
  return watsonOptions
}

function getOtherOptions(){
  return otherOptions
}

module.exports = {
  setWatsonOptions: setWatsonOptions,
  setOtherOptions: setOtherOptions,
  getWatsonOptions: getWatsonOptions,
  getOtherOptions: getOtherOptions,
};