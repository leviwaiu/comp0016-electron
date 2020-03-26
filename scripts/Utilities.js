const Processor = require('./Processor');
const path = require('path');

function removeArray(arr){
  let what, a = arguments, L = a.length, ax;
  while(L > 1 && arr.length){
    what = a[--L];
    while((ax = arr.indexOf(what)) !== -1){
      arr.splice(ax, 1);
    }
  }
  return arr;
}

function loadMainMenu(mainWindow){
  mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
  mainWindow.webContents.on('did-finish-load', () => {
    let savedInput = Processor.getSavedInput();
    mainWindow.webContents.send('restore-input', savedInput);
  });
}


module.exports.removeArray = removeArray;
module.exports.loadMainMenu = loadMainMenu;