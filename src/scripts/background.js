import undertab from 'scripts/undertab'
console.log("starting overtab listeners");

chrome.runtime.onStartup.addListener( undertab.startup );
//chrome.runtime.onSuspend.addListener( shutdown );
chrome.runtime.onInstalled.addListener( undertab.install );

//listen for a message
chrome.runtime.onMessage.addListener( undertab.onMessage );

//listen for tab states
chrome.tabs.onCreated.addListener( undertab.tabCreated );
chrome.tabs.onUpdated.addListener( undertab.tabUpdated );

chrome.tabs.onActivated.addListener( undertab.tabActivated );
chrome.tabs.onRemoved.addListener( undertab.tabRemoved );

//clicking on the browser menu item
chrome.browserAction.onClicked.addListener( undertab.actionClick );
console.log( undertab );

//if a tab is replaced (only for prerender)
chrome.tabs.onReplaced.addListener( undertab.tabReplaced );

chrome.runtime.onSuspend.addListener( function(){
  //console.log("notify", "suspended");
});
chrome.runtime.onSuspendCanceled.addListener( function(){
  //console.log("notify", "suspend cancelled");
});

var getCurrentTab = function( callback ){
  chrome.tabs.getCurrent( callback );
};

chrome.commands.onCommand.addListener(function(command) {
  switch( command ){
    case "open-overtab":
      browserActionClick();
      break;
  }
});
