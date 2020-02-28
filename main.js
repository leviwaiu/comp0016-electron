'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./Window');
const Processor = require('./Processor');
const Watson_Test = require('./WatsonTest');
const apiKeys = require('./apiKeys');
let temp_displayed;
//Frontend Development Use Only
//require('electron-reload')(__dirname)

let firebase = require("firebase/app");
require("firebase/auth");

let firebaseConfig = {
    apiKey: apiKeys.FirebaseKey,
    authDomain: "electron-26478.firebaseapp.com",
    databaseURL: "https://electron-26478.firebaseio.com",
    projectId: "electron-26478",
    storageBucket: "electron-26478.appspot.com",
    messagingSenderId: "745584394714",
    appId: "1:745584394714:web:d8ad3134ebc3cfd919c0e3",
    measurementId: "G-Z81RE8P952"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


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

    ipcMain.on('enter-form-submission', (event) => {
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
    })

    ipcMain.on('analyse-form-submission', (event, service, files, destPath, apiKey) =>{
        console.log("Analyse button pressed");
        console.log(files);
        if(files === null){
            dialog.showMessageBox(null, error_options);
            return;
        }
        if(destPath === null){
            dialog.showMessageBox(null, {
                type:"error",
                title:"Missing Destination",
                message:"Missing Destination",
                detail:"A destination path has not been specified",
                buttons:['OK']
            });
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
        mainWindow.loadFile(path.join('renderer', 'analysing.html'));
        Processor.changeCredentialsApi(apiKey);
        Processor.setParameters("1", mainWindow);
        Processor.processFile(event, files, destPath);
    })

    ipcMain.on('logout', () => {
        mainWindow.loadFile(path.join('renderer', 'index.html'));
    })

    ipcMain.on('displays-file', (event, file)=>{
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        temp_displayed = file[0];
        Processor.displayFile(file[0], mainWindow);
    })
    ipcMain.on('analyse-continue', () => {
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

    ipcMain.on('open-credentials', () => {
        let newWindow = new Window( {
            file: path.join('renderer', 'credentials.html'),
            height:400,
            width:500,
        });
    })

    ipcMain.on('credentials-change', (event, username, password) => {
        Processor.changeCredentials(username, password);
    })

    ipcMain.on('credentials-change-apikey', (event, apiKey) => {
        Processor.changeCredentialsApi(apiKey);
        event.sender.send('window-close');
    })

    ipcMain.on('credential-dontchange', () =>{
        mainWindow.webContents.send('close-credentials');
    })

    ipcMain.on('close-signup',(event, username, password) =>{
        mainWindow.webContents.send('close-signup-window');
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
        for(let i =0; i<files.length;i++){
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

    ipcMain.on('deletecsv', (event, file, nb) => {
        console.log(file);
        if(fs.existsSync(file)){
            fs.unlink(file,(err)=>{
                if(err){
                    mainWindow.webContents.send('file-delete-error');
                    alert("An error occurred updating the file: " + err.message);
                    console.log(err);
                }
            })
        }
        mainWindow.webContents.send('deleterow', nb);
    })

    ipcMain.on('viewcsv', (event,file) => {
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        temp_displayed = file;
        Processor.displayFile(file, mainWindow);
    })

    ipcMain.on('savecsv', (event, file) =>{
        fs.createReadStream(file).pipe(fs.createWriteStream(file));
        mainWindow.webContents.send('successful-save');
    })

    //DEBUG ONLY
    ipcMain.on('debug-test-watson-npm', () => {
        Watson_Test.watson_Test();
    })

}

app.on('ready', function(){
    createWindow();
});

