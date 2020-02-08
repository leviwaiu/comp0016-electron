const fs = require('fs');
const Watson = require('./Watson');

let ser_username = "";
let ser_password = "";

function processFile(event, service, filePath, mainWindow){

  console.log("At ProcessFile" + filePath);

  //TODO: Implement handling of multiple files at this level


  /**const ls = spawn("java",spawnString);

  ls.stdout.on('data', (data) => {
    mainWindow.webContents.send('log-data', data)
  });

  ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    mainWindow.webContents.send('log-data', data)
    if(data.includes("HTTP FAILED")){
      ls.kill();
    }
  });

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    event.reply('analyse-finish');
  });
  **/

  Watson.callWatsonApi(true, [filePath], mainWindow, event);

}

function displayFile(filePath, mainWindow){
  fs.readFile(filePath, {encoding:'utf-8'}, function(err, data){
    let data_list;
    let final_html = "";
    if (!err) {
      data_list = data.toString().split('\n');
      for(var i = 1; i < data_list.length; i++){
        final_html += "<tr>\n"
        data_separated = data_list[i].split(', ')
        for(var j = 0; j < data_separated.length; j++){
          final_html += "<td>" + data_separated[j] + "</td>\n";
        }
        final_html += "</tr>\n";
      }
      mainWindow.webContents.on('did-finish-load', ()=> {
        mainWindow.webContents.send('display-data', final_html);
        console.log("sent");
      });
    } else {
      console.log(err)
    }
  })
}

function changeCredentials(username, password){
  ser_username = username;
  ser_password = password;
}

module.exports.processFile = processFile
module.exports.displayFile = displayFile
module.exports.changeCredentials = changeCredentials