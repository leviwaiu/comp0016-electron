const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron');
const path = require('path');

let ipcRenderer;

let appSettings = {
  path:electronPath,
  args:[path.join(__dirname, '..')],
}

//Unfortunately the Save and Open Dialogue Options by themselves are not testable with this framework.

describe('Main menu input errors', function() {

  beforeEach(function () {
    let self = this;
    this.app = new Application(appSettings);
    return this.app.start().then(function () {
      assert.equal(self.app.isRunning(), true);
      ipcRenderer = self.app.electron.ipcRenderer;
    });
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  })

  it('should reject if no input at all', function () {
    let self = this;
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$('#analyse-button').click().then(function () {
      return self.app.client.$('#analyse-button').then(function (analyse) {
        assert.notEqual(analyse.value, null);
      })
    })
  })

  it('should reject with only origin input', function () {
    this.app.client.$('#enter').click();
    this.app.client.waitUntilWindowLoaded().then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", "some/random/file", null, null);
    })
    return this.app.client.waitUntilWindowLoaded().$("#analyse-button").then(function (analyse) {
      assert.notEqual(analyse.value, null);
    })
  })

  it('should reject with only destination input', function () {
    this.app.client.$('#enter').click();
    this.app.client.waitUntilWindowLoaded().then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", null, "some/random/file", null);
    })
    return this.app.client.waitUntilWindowLoaded().$("#analyse-button").then(function (analyse) {
      assert.notEqual(analyse.value, null);
    })
  })

  it('should reject with only API', function () {
    this.app.client.$('#enter').click();
    this.app.client.waitUntilWindowLoaded().then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", null, null, "randomAPI");
    })
    return this.app.client.waitUntilWindowLoaded().$("#analyse-button").then(function (analyse) {
      assert.notEqual(analyse.value, null);
    })
  })

  it('should reject with only one of the items missing', function () {
    let self = this;
    this.app.client.$('#enter').click();
    this.app.client.waitUntilWindowLoaded().then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", null, "some/random/file", "randomAPI");
    })
    return this.app.client.waitUntilWindowLoaded().$("#analyse-button").then(function (analyse) {
      assert.notEqual(analyse.value, null);
    }).then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", "some/random/file", null, "randomAPI");
      return self.app.client.waitUntilWindowLoaded().$('#analyse-button').then(function (analyse) {
        assert.notEqual(analyse.value, null);
      })
    }).then(function () {
      ipcRenderer.send('analyse-form-submission', "IBM", "some/random/file", "some/random/file", null);
      return self.app.client.waitUntilWindowLoaded().$('#analyse-button').then(function (analyse) {
        assert.notEqual(analyse.value, null);
      })
    })
  })
})

describe('Main Menu functional features', function(){
  this.timeout(10000);

  beforeEach(function () {
    let self = this;
    this.app = new Application(appSettings);
    return this.app.start().then(function () {
      assert.equal(self.app.isRunning(), true);
      ipcRenderer = self.app.electron.ipcRenderer;
    });
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  })

  it('toggles the credits screen correctly', function(){
    let self = this;
    this.app.client.$('#enter').click();
    this.app.client.waitUntilWindowLoaded().$("#credentials-button").click().then(function() {
      return self.app.client.switchWindow("Service Settings").then(function () {
        return self.app.client.getTitle().then(function (title) {
          return assert.equal(title, "Service Settings");
        })
      })
    });
  })

  it('returns to the main menu', function(){
    let self = this;
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().$("#logout-button").click().then(function(){
      return self.app.client.waitUntilWindowLoaded().$('#enter').then(function(enter){
        return assert.notEqual(enter.value, null);
      })
    });
  })

  it('executes when all variables are present', function(){
    let self = this;
    this.app.client.$('#enter').click();
    return this.app.client.waitUntilWindowLoaded().then(function () {
      let testDirInput = path.join(__dirname, "zzTestFolder", "sample.wav");
      let testDirOutput = path.join(__dirname, "zzTestOutput");
      ipcRenderer.send('analyse-form-submission', "IBM", [testDirInput],
        testDirOutput, "randomAPI");
    }).then(function(){
      return self.app.client.waitUntilWindowLoaded().$("#log-button").then(function(logButton){
        return assert.notEqual(logButton, null);
      })
    })
  })
})