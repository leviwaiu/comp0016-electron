const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron');
const path = require('path');

let appSettings = {
  path:electronPath,
  args:[path.join(__dirname, '..')],
}

describe('Application Launch', function() {
  this.timeout(10000);

  beforeEach(function(){
    this.app = new Application(appSettings);
    return this.app.start()
  })

  afterEach(function() {
    if(this.app && this.app.isRunning()){
      return this.app.stop();
    }
  })

  it('shows the main window', function() {
    return this.app.client.getWindowCount().then(function(count){
      assert.equal(count, 1);
    })
  })

  it('shows the correct title', function(){
    return this.app.client.getTitle().then(function(title){
      assert.equal(title, "Transcription Service");
    })
  })

  it('enters main menu', function(){
    let self = this;
    return this.app.client.$('#enter').click().then(function(){
      return self.app.client.$('#analyse-form').then(function(thing){
        assert.notEqual(thing, null);
      })
    })
  })

})

describe('Main Menu Features', function(){
  this.timeout(10000);

  beforeEach(function(){
    this.app = new Application(appSettings);
    return this.app.start();
  })

  afterEach(function(){
    if(this.app && this.app.isRunning()){
      return this.app.stop();
    }
  })

  it('shows the service select boxes', function(){
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$('#service-select').getValue().then(function(select){
      assert.equal(select, "IBM");
    })
  })

  it('shows the file select boxes', function(){
    let self = this;
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$('#file-select').then(function(fileSelect){
      assert.notEqual(fileSelect.value, null);
    }).then(function(){
      return self.app.client.$('#directory-select').then(function(directorySelect){
        assert.notEqual(directorySelect.value, null);
      })
    }).then(function(){
      return self.app.client.$('#filename').getText().then(function(filename){
        assert.equal(filename, 'No File Selected');
      })
    });
  })

  it('shows the save boxes', function(){
    let self = this;
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$('#destination-button').then(function(saveSelect){
      assert.notEqual(saveSelect.value, null);
    }).then(function(){
      return self.app.client.$('#destination-show').getText().then(function(destination){
        assert.equal(destination, 'No Path Specified');
      })
    })
  })

  it('shows the API button', function(){
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$('#api-key').then(function(apiInput) {
      assert.notEqual(apiInput.value, null);
    })
  })

  it('shows the bottom row buttons', function(){
    let self = this;
    this.app.client.$("#enter").click();
    return this.app.client.waitUntilWindowLoaded().
      $('#logout-button').getText().then(function(text){
        assert.equal(text,"Log Out");
    }).then(function(){
      self.app.client.$('#credentials-buttons').getText().then(function(text){
        assert.equal(text,"Edit Settings");
      })
    }).then(function(){
      self.app.client.$("#analyse-button").getText().then(function(text){
        assert.equal(text, "Start Analysis");
      })
    })
  })
})