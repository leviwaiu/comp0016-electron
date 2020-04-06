'use strict'

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const Window = require('./scripts/Window');
const Processor = require('./scripts/Processor');
const Watson_Test = require('./test/WatsonTest');
const commonEmitter = require('./scripts/Emitter');
const Utilities = require('./scripts/Utilities');
const Settings = require('./scripts/Settings');

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
        if(apiKey === "" || apiKey === null){
            dialog.showMessageBox(null, {type:"warning",
            title:"No API Key entered",
            message:"API Key not given",
            detail:"We would require an API Key in order to continue",
            buttons:['OK']
            });
            return;
        }

        mainWindow.loadFile(path.join('renderer', 'analysing.html'));


        //Hacky way to ensure this runs only once
        let ran = false;

        mainWindow.webContents.on('did-finish-load', ()=>{
            Processor.changeCredentialsApi(apiKey);
            Processor.setParameters(service, mainWindow);
            if(!ran) {
                Processor.processFile(event, files, destPath);
                ran = true;
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
        let finished = false;
        if(!finished) {
            if (fileType === 3) {
                mainWindow.loadFile(path.join('renderer', 'fileExplorer.html'));
                mainWindow.webContents.on('did-finish-load', () => {
                    Processor.displayDirectory();
                    finished = true;
                });
            } else if (fileType === 2) {
                mainWindow.loadFile(path.join('renderer', 'multipleFileTable.html'));
                mainWindow.webContents.on('did-finish-load', () => {
                    Processor.displayFileList();
                    finished = true;
                })
            } else if (fileType === 1) {
                mainWindow.loadFile(path.join('renderer', 'results.html'));
                mainWindow.webContents.on('did-finish-load', () => {
                    Processor.displayFileSingle();
                    finished = true;
                })
            }
        }
    })

    ipcMain.on('analyse-cancel', () => {
        commonEmitter.commonEmitter.emit('stop');
        Utilities.loadMainMenu(mainWindow);
    })

    ipcMain.on('return-to-login', () => {
            Utilities.loadMainMenu(mainWindow);
    })

    ipcMain.on('return-button-result', ()=>{
        let fileType = Processor.returnInputType();
        console.log(fileType);
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
            });
        }
        else if(fileType === 1){
            Utilities.loadMainMenu(mainWindow);
        }
    })


    ipcMain.on('open-credentials', () => {
        let newWindow = new Window( {
            file: path.join('renderer', 'credentials.html'),
            height:400,
            width:500,
        });

        newWindow.webContents.on('did-finish-load', () => {
            let options = Settings.getWatsonOptions();
            let otherOptions = Settings.getOtherOptions();
            newWindow.webContents.send('update-current-options', options, otherOptions);
        })
    })

    ipcMain.on('options-change', (event, results, moreResults) => {
        Settings.setWatsonOptions(results);
        Settings.setOtherOptions(moreResults);
    })

    ipcMain.on('options-dontchange', () =>{
        mainWindow.webContents.send('close-credentials');
    })

    ipcMain.on('delete-file', (event, file, number) => {
        console.log("Deleted File");
        let confirmBox = dialog.showMessageBoxSync(null, {
            type:"warning",
            title:"Confirmation",
            message:"Are you sure you want to delete this file?",
            buttons:["No","Yes"]
        })
        if(confirmBox === 1) {
            const tempFile = file;
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            dialog.showMessageBoxSync(null, {
                type: "info",
                title: "Delete Successful",
                message: "The file has been deleted",
                buttons:["OK"]
            })
            let fileType = Processor.returnInputType();
            if(fileType === 1) {
                Utilities.loadMainMenu(mainWindow);
            }
            else if(fileType === 2){
                let fileCount = Processor.getFileNumber();
                if(fileCount > 1){
                    mainWindow.webContents.send('delete-row', number)
                } else {
                    Utilities.loadMainMenu(mainWindow);
                }
                Processor.removeFile(file);
            }
            else if(fileType === 3){
                Processor.removeFile(file);
                let fileCount = Processor.getFileNumber();
                if(fileCount >= 1) {
                    mainWindow.webContents.reload();
                } else {
                    Utilities.loadMainMenu(mainWindow);
                }
            }
        }
    })

    ipcMain.on('deletion', (event, files) => {
        for(let i =0; i<files.length;i++){
            if(fs.existsSync(files[i])){
                fs.unlinkSync(files[i]);
        }
            console.log('tempFile does not exist');
        }
        mainWindow.webContents.send('files-delete-successful');
    })

    ipcMain.on('viewcsv', (event,file) => {
        mainWindow.loadFile(path.join('renderer', 'results.html'));
        temp_displayed = file;
        mainWindow.webContents.on('did-finish-load', () => {
            Processor.displayFile(file);
        });
    })

    ipcMain.on('delete-all', () => {
        let confirmBox = dialog.showMessageBoxSync(null, {
            type:"warning",
            title:"Confirmation (All Files)",
            message:"Are you sure you want to delete all files?",
            buttons:["No","Yes"]
        })
        if(confirmBox === 1) {
            Processor.deleteAll();
            Utilities.loadMainMenu(mainWindow);
        }
    })

    //DEBUG ONLY
    ipcMain.on('debug-test-watson-npm', () => {
        Watson_Test.watson_Test();
    })

    commonEmitter.commonEmitter.on('watson-error', (event) => {
        let options = {
            type:"error",
            title:event.statusText,
            message:event.message,
            buttons:["Okay"],
        }
        if(event.statusText === "ENOTFOUND"){
            options.message = event.body;
        }

        dialog.showMessageBoxSync(null, options)
        commonEmitter.commonEmitter.emit('stop');
        Utilities.loadMainMenu(mainWindow);
    })
}


app.on('ready', function(){
    createWindow();
});

module.exports.createWindow = createWindow;