'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./Window');
const Processor = require('./Processor');
const Watson_Test = require('./WatsonTest');
let temp_displayed;
//Frontend Development Use Only
require('electron-reload')(__dirname)

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDVYD73yW6tSEx5fTot0jPmqAGPa8BupK8",
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

    ipcMain.on('login-form-submission', (event, username, password) => {

        firebase.auth().signInWithEmailAndPassword(username,password).then(function(){
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
        }).catch(function(error){
            if(error != null){
                mainWindow.webContents.send('login-error');
                console.log(error.message);
                return;
            }
        })
    })

    ipcMain.on('signup-submission', (event, username, password) => {
        firebase.auth().createUserWithEmailAndPassword(username, password).catch(function(error){
            if(error != null){
                console.log(error.code);
                console.log(error.message);
                return;
            }
    })

        //     //TEMPORARY LOGIN CONTROL FOR PROOF OF CONCEPT
        // if(username === "admin" && password === "1234") {
        //     mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
        // } else {
        //     mainWindow.webContents.send('login-error');
        // }
    });

    ipcMain.on('analyse-form-submission', (event, service, files, destPath) =>{
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
        Processor.processFile(event, "1", files, destPath, mainWindow);
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
        // console.log("there");
        mainWindow.webContents.send('close-credentials');
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

    ipcMain.on('debug-test-azure-npm', () => {
        AzureTest();
    })
}

app.on('ready', function(){
    createWindow();
});

