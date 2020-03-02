
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

    fs.readdirSync(readPath).forEach(file => {
      let fileInfo = new FileTree(path.join(readPath, file), file);
      let stat = fs.statSync(fileInfo.path);
      if(stat.isDirectory()){
        fileInfo.items = FileTree.readDir(fileInfo.path);
      }

      fileArray.push(fileInfo);
    })

    return fileArray;
  }

}

module.exports = FileTree;