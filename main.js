'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./Window');
const Processor = require('./Processor');
const Watson_Test = require('./WatsonTest');

let temp_displayed;

//Frontend Development Use Only
//require('electron-reload')(__dirname)

require("firebase/auth");

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
        if(apiKey === ""){
            dialog.showMessageBox(null, {type:"warning",
            title:"No API Key entered",
            message:"API Key not given",
            detail:"We would require an API Key in order to continue",
            buttons:['OK']})
            return;
        }
        mainWindow.loadFile(path.join('renderer', 'analysing.html'));


        //Hacky way to ensure this runs only once
        let runned = false;

        mainWindow.webContents.on('did-finish-load', ()=>{
            Processor.changeCredentialsApi(apiKey);
            Processor.setParameters("1", mainWindow);
            if(!runned) {
                Processor.processFile(event, files, destPath);
                runned = true;
            }
            mainWindow.show();
        })
    })

    ipcMain.on('logout', () => {
        mainWindow.loadFile(path.join('renderer', 'index.html'));
    })

    ipcMain.on('displays-file', (event, file)=>{
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        temp_displayed = file[0];
        Processor.displayFile(file[0]);
    })

    ipcMain.on('analyse-continue', () => {
        let fileType = Processor.returnInputType();
        if(fileType === 3) {
            mainWindow.loadFile(path.join('renderer', 'fileExplorer.html'));
            mainWindow.webContents.on('did-finish-load', () =>{
                Processor.displayDirectory();
            });
        }
        else if(fileType === 2){
            mainWindow.loadFile(path.join('renderer', 'multipleFileTable.html'));
            mainWindow.webContents.on('did-finish-load', ()=>{
                Processor.displayFileList();
            })
        }
        else if(fileType === 1){
            mainWindow.loadFile(path.join('renderer', 'results.html'));
            mainWindow.webContents.on('did-finish-load', () => {
                Processor.displayFileSingle();
            })
        }
    })

    ipcMain.on('return-to-login', () => {
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
    })
    ipcMain.on('return-button-result', ()=>{
        let fileType = Processor.returnInputType();
        if(fileType === 3) {
            mainWindow.loadFile(path.join('renderer', 'fileExplorer.html'));
        }
        else if(fileType === 2){
            mainWindow.loadFile(path.join('renderer', 'multipleFileTable.html'));
        }
        else if(fileType === 3){
            mainWindow.loadFile(path.join('renderer', 'mainmenu.html'));
        }
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

    ipcMain.on('options-change', (event, username, password) => {
        Processor.changeCredentials(username, password);
    })

    ipcMain.on('options-dontchange', () =>{
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
        mainWindow.webContents.on('did-finish-load', () => {
            Processor.displayFile(file);
        });
    })



    //DEBUG ONLY
    ipcMain.on('debug-test-watson-npm', () => {
        Watson_Test.watson_Test();
    })
}

app.on('ready', function(){
    createWindow();
});