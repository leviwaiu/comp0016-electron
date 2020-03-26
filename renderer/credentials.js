'use strict'

const {ipcRenderer} = require('electron');


//Setting Values are included below
const model = document.getElementById('stt-model');
const timeStamps = document.getElementById('timeCheck');
const confidence = document.getElementById('confidenceCheck');
const deleteData = document.getElementById('deleteCheck');

document.getElementById('cancel-button').addEventListener('click', function () {
  window.close()
})

document.getElementById('return-button').addEventListener('click', function () {
  let modelIndex = model.selectedIndex;
  const results = {
    model: model[modelIndex].value,
  }
  const moreResults = {
    gapSpeaker: timeStamps.checked,
    speakerConfidence: confidence.checked,
    deleteData: deleteData.checked,
  }

  ipcRenderer.send('options-change', results, moreResults);
  window.close()
})

ipcRenderer.on('update-current-options', (event, options, moreOptions) => {
  console.log(options.model);

  model.value = options.model;

  timeStamps.checked = moreOptions.gapSpeaker;
  confidence.checked = moreOptions.speakerConfidence;

})

ipcRenderer.on('window-close', function() {
  window.close();
})
