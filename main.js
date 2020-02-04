'use strict'



const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./Window');
const Processor = require('./Processor');

require('electron-reload')(__dirname)

var firebaseConfig = {
    apiKey: "AIzaSyCIvk3vGu7H6Fa0Jlm66ffoLCi_pbyLVfs",
    authDomain: "electron-project-10d2a.firebaseapp.com",
    databaseURL: "https://electron-project-10d2a.firebaseio.com",
    projectId: "electron-project-10d2a",
    storageBucket: "electron-project-10d2a.appspot.com",
    messagingSenderId: "66238223387",
    appId: "1:66238223387:web:1f8e121fb0c64a895014be",
    measurementId: "G-H7CFXVQN6E"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

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
   
        //     //TEMPORARY LOGIN CONTROL FOR PROOF OF CONCEPT
        // if(username === "admin" && password === "1234") {
        //     mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
        // } else {
        //     mainWindow.webContents.send('login-error');
        // }
    });

    ipcMain.on('close-signup', (event, username, password) => {
        firebase.auth().createUserWithEmailAndPassword(username, password).catch(function(){
            if(error != null){
                console.log(error.message);
                return;
            }
        })
        mainWindow.webContents.send('close-signup-window');
    })

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
        fs.createReadStream("sample.csv").pipe(fs.createWriteStream(filename.filePath));
        mainWindow.webContents.send('successful-save');
    })

    ipcMain.on('credentials-change', (event, username, password) => {
        Processor.changeCredentials(username, password);
        console.log("there");
        mainWindow.webContents.send('close-credentials');
    })

    ipcMain.on('close-signup',(event, username, password) =>{
        mainWindow.webContents.send('close-signup-window');
    })


    ipcMain.on('delete-temp-file', () => {
        const tempFile = 'sample.csv'
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
}

app.on('ready', function(){
    createWindow();
});