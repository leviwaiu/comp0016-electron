'use strict'

const { BrowserWindow } = require('electron')
const path = require('path')

const defaultProps = {
    width:800,
    height:500,
    show:false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
    },
    minWidth:500,
    minHeight:600

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