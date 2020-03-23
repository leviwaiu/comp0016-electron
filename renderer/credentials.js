'use strict'

const {ipcRenderer} = require('electron');


//Setting Values are included below
const model = document.getElementById('stt-model');
const speakerLabels = document.getElementById('labelCheck');
const timeStamps = document.getElementById('timeCheck');
const confidence = document.getElementById('confidenceCheck');

document.getElementById('cancel-button').addEventListener('click', function () {
  window.close()
})

document.getElementById('return-button').addEventListener('click', function () {
  let modelIndex = model.selectedIndex;
  const results = {
    model: model[modelIndex].value,
    speakerLabels: speakerLabels.checked,
    timestamps: timeStamps.checked,
    wordConfidence: confidence.checked,
  }
  ipcRenderer.send('options-change', results);
  window.close()
})

ipcRenderer.on('update-current-options', (event, options) => {
  console.log(options.model);

  model.value = options.model;

  speakerLabels.checked = options.speakerLabels;
  timeStamps.checked = options.timestamps;
  confidence.checked = options.wordConfidence;

})

ipcRenderer.on('window-close', function() {
  window.close();
})
