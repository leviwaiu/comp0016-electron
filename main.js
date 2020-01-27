'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs')

const Window = require('./Window');
const Processor = require('./Processor');

require('electron-reload')(__dirname)

const error_options = {
    type:"error",
    title:"Missing file",
    message:"Missing File",
    detail:"A file has not been selected for analysis",
    buttons:['OK']
}


function createWindow(){
    let mainWindow = new Window({
        file: path.join('renderer', 'index.html')
    })

    ipcMain.on('login-form-submission', (event, username, password) => {
        //TEMPORARY LOGIN CONTROL FOR PROOF OF CONCEPT
        if(username === "admin" && password === "1234") {
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
        } else {
            mainWindow.webContents.send('login-error');
        }
    });

    ipcMain.on('analyse-form-submission', (event, service, file) =>{
        console.log("Analyse button pressed");
        console.log(file);
        if(file === null){
            dialog.showMessageBox(null, error_options);
            return;
        }
        if(service !== "IBM"){
            dialog.showMessageBox(null,{type:"warning",
            title:"Unsupported Feature",
            message:"Feature not Implemented",
            detail:"Unfortunately, we have yet to implement this Service. We apologise for the misunderstandings.",
            buttons:['OK']})
            return;
        }
        Processor.processFile(event, "1", file, mainWindow);
        mainWindow.loadFile(path.join('renderer', 'analysing.html'));

    })

    ipcMain.on('logout', () => {
        mainWindow.loadFile(path.join('renderer', 'index.html'));
    })

    ipcMain.on('analyse-continue', async () => {
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        Processor.displayFile('sample.csv', mainWindow);
    })

    ipcMain.on('return-to-login', () => {
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
    })

    ipcMain.on('save-file', (event, filename) => {
        fs.createReadStream('sample.csv').pipe(fs.createWriteStream(filename));
        mainWindow.webContents.send('successful-save');
    })

    ipcMain.on('credentials-change', (event, username, password) => {
        Processor.changeCredentials(username, password);
        console.log("there");
        mainWindow.webContents.send('close-credentials');
    })
}

app.on('ready', function(){
    createWindow();
});