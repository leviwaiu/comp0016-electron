'use strict'

const {app, dialog, ipcMain} = require('electron');
const {exec} = require('child_process');
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

let outputFiles;

function createWindow(){
    let mainWindow = new Window({
        file: path.join('renderer', 'index.html')
    })

    ipcMain.on('login-form-submission', (event, username) => {
        console.log("this is the username from the form:", username)
        mainWindow.loadFile(path.join('renderer','mainmenu.html'));
    });

    ipcMain.on('analyse-form-submission', (event, service, file) =>{
        console.log("Analyse button pressed");
        console.log(file);
        if(file === null){
            dialog.showMessageBox(null, error_options);
            return;
        }
        Processor.processFile(event, "1", file);
        mainWindow.loadFile(path.join('renderer', 'analysing.html'));

    })

    ipcMain.on('logout', (event) => {
        mainWindow.loadFile(path.join('renderer', 'index.html'));
    })

    ipcMain.on('analyse-continue', async () => {
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        Processor.displayFile('sample.csv', mainWindow);
    })

    ipcMain.on('return-to-login', (event) => {
        mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
    })

    ipcMain.on('save-file', (event, filename) => {
        fs.createReadStream('sample.csv').pipe(fs.createWriteStream(filename));
    })
}

app.on('ready', function(){
    createWindow();
});