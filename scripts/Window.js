'use strict'

const { BrowserWindow } = require('electron')
const path = require('path')

const defaultProps = {
    width:550,
    height:675,
    show:false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
    },
    minWidth:550,
    minHeight:675
};

class Window extends BrowserWindow {
    constructor ({file, ...windowSettings }) {
        //Calls new BrowserWindows
        super ({ ...defaultProps, ...windowSettings})

        this.loadFile(file)

        //Developer Tools
        //this.webContents.openDevTools()

        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = Window