
const fs = require('fs');
const path = require('path');

class FileTree {
  constructor(path, name = null){
    this.path = path;
    this.name = name;
    this.items = [];
  }

  static readDir(readPath) {
    let fileArray = [];

    try{
      fs.readdirSync(readPath).forEach(file => {
        let fileInfo = new FileTree(path.join(readPath, file), file);
        let stat = fs.statSync(fileInfo.path);
        if(stat.isDirectory()){
          fileInfo.items = FileTree.readDir(fileInfo.path);
        }

        fileArray.push(fileInfo);
      })
    } catch (err){
      if(err.code === 'ENOENT') {
        console.log("No file")
      } else if(err.code === 'EACCES') {
        console.log("No Access")
      } else {
        throw err;
      }

    }

    return fileArray;
  }

}

module.exports = FileTree;