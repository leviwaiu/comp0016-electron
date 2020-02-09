'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs')

const firebase = require('firebase-admin');
const Window = require('./Window');
const Processor = require('./Processor');
const Watson_Test = require('./Watson_Test');
let temp_displayed;
//Frontend Development Use Only
//require('electron-reload')(__dirname)

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

    ipcMain.on('analyse-form-submission', (event, service, files) =>{
        console.log("Analyse button pressed");
        console.log(files);
        if(files === null){
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
        Processor.processFile(event, "1", files, mainWindow);
        mainWindow.loadFile(path.join('renderer', 'analysing.html'));

    })

    ipcMain.on('logout', () => {
        mainWindow.loadFile(path.join('renderer', 'index.html'));
    })

    ipcMain.on('displays-file', (event, file)=>{
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        temp_displayed = file[0];
        Processor.displayFile(file[0], mainWindow);
    })
    ipcMain.on('analyse-continue', async () => {
        mainWindow.loadFile(path.join('renderer', 'intermediate.html'));
    })

    ipcMain.on('return-to-login', () => {
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
    })
    ipcMain.on('return-to-intermediate', ()=>{
        mainWindow.loadFile(path.join('renderer', 'intermediate.html'));
    })

    ipcMain.on('save-file', () => {
        fs.createReadStream(temp_displayed).pipe(fs.createWriteStream(temp_displayed));
        mainWindow.webContents.send('successful-save');
        
    })

    ipcMain.on('save-files', (event, filename) => {
        for(var i =0; i<filename.length;i++){
        fs.createReadStream(filename[i]).pipe(fs.createWriteStream(filename[i]));
        mainWindow.webContents.send('successful-save');
        }
    })

    ipcMain.on('credentials-change', (event, username, password) => {
        Processor.changeCredentials(username, password);
        console.log("there");
        mainWindow.webContents.send('close-credentials');
    })

    ipcMain.on('delete-temp-file', () => {
        const tempFile = temp_displayed;
        if(fs.existsSync(tempFile)){
            fs.unlink(tempFile, (err) => {
                if(err){
                    mainWindow.webContents.send('file-delete-error');
                    alert("An error occurred updating the file: " + err.message);
                    console.log(err);
                }
            })
            mainWindow.webContents.send('file-delete-successful');

            console.log('tempFile does not exist');
        }
    })

    ipcMain.on('deletion', (event, files) => {
        for(var i =0; i<files.length;i++){
            if(fs.existsSync(files[i])){
                fs.unlink(files[i], (err) => {
                    if(err){
                        mainWindow.webContents.send('file-delete-error');
                        alert("An error occurred updating the file: " + err.message);
                        console.log(err);
                    }
                })
        }
            console.log('tempFile does not exist');
        }
        mainWindow.webContents.send('files-delete-successful');
    })

    //DEBUG ONLY
    ipcMain.on('debug-test-watson-npm', () => {
        Watson_Test.watson_Test();
    })
}

app.on('ready', function(){
    createWindow();
});