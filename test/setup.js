/* setup the env and mock out the chrome extension functions */

var chrome = {
  tabs: {
    onUpdated: {
      addListener: jasmine.createSpy()
    },
    onCreated: {
      addListener: jasmine.createSpy()
    },
    onActivated: {
      addListener: jasmine.createSpy()
    },
    onRemoved: {
      addListener: jasmine.createSpy()
    }
  },
  runtime: {
    onMessage: {
      addListener: jasmine.createSpy()
    },
    sendMessage: jasmine.createSpy()
  },
  browserAction: {
    onClicked: {
      addListener: jasmine.createSpy()
    }
  }
}
