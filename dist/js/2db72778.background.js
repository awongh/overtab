"use strict";function tabEvent(a,b){sendMessage(null,{message:b,id:a})}var LOG_LEVEL="vvv",logger=console.log;console.log=function(){if(arguments.length>=2){var a=arguments[0];switch(LOG_LEVEL){case"production":break;case"v":"errors"==a&&logger.apply(this,arguments);break;case"vv":("errors"==a||"warn"==a)&&logger.apply(this,arguments);break;case"vvv":logger.apply(this,arguments)}}},Object.size=function(a){var b,c=0;for(b in a)a.hasOwnProperty(b)&&c++;return c},Array.prototype.remove=function(a){return this.splice(a,1)},Array.prototype.add=function(a,b){if(!b)throw"Trying to add a null variable to array. -oops";return this.splice(a,0,b)},Array.prototype.hasValue=function(a){return-1===this.indexOf(a)?!1:!0},Array.prototype.removeValue=function(a){var b=this.indexOf(a);return-1===b?!1:this.remove(b)},Array.prototype.getByValue=function(a){var b=this.indexOf(a);return-1!==b?this[b]:!1},Array.prototype.getByValueProperty=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]==b)return this[c];return!1},Array.prototype.hasValueProperty=function(a,b){return this.getByValueProperty(a,b)===!1?!1:!0},Array.prototype.valuePropertyIndex=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]===b)return c;return!1};var DISALLOWED_SCREENCAP_URLS=["chrome://newtab/"],ALLOWED_PROTOCOLS=["http:","https:","chrome:"],Parser=function(){this.parser=document.createElement("a")};Parser.prototype={href:function(a){return this.parser.href=a,this},protocol:function(){return this.parser.protocol},hostname:function(){return this.parser.hostname},port:function(){return this.parser.port},pathname:function(){return this.parser.pathname},search:function(){return this.parser.search},hash:function(){return this.parser.hash},host:function(){return this.parser.host}};var stringToInt=function(a){for(var b=0,c="ABCDEFGHIJKLMNOPQRSTUVWXYZ",d=a.toUpperCase(),e=0;e<d.length;e++)b+=c.indexOf(d[e]);return b},THUMBSIZE=150,SCREEN_CROP_RATIO=1,OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,OVERTAB_DEFAULT_OPEN_FUNC=chrome.tabs.create,OVERTAB_ARRAY=[],tabCreated=function(a){console.log("notify","tabcreated - undefined",a.id),console.log("notify","tabcreated - url",a.url),console.log("notify","tabcreated - title",a.title);var b=new Parser,c=b.href(a.url).protocol(),d=b.href(a.url).hostname();if("undefined"!=typeof a.id&&-1!==ALLOWED_PROTOCOLS.indexOf(c)&&a.id!=OVERTAB_TAB_ID){var e={};e[a.id]=a.url,e["screencap-"+a.id]="",e["screencap-url-"+a.id]="",console.log("notify","created about to set:",a.id,a.url,"======"),lsSet(e,function(){tabEvent(a.id,"created")})}else console.log("error","ERROR: something happened on create:",a),console.log("error","protocol:",c,"hostname",d)},tabUpdated=function(a,b,c){var d=new Parser,e=d.href(c.url).protocol(),f=d.href(c.url).hostname();if("undefined"!=typeof c.id&&-1!==ALLOWED_PROTOCOLS.indexOf(e)&&a!=OVERTAB_TAB_ID){var g=c.id;lsGet(g,function(a){if(console.log("notify","lsget: result:",a,chrome.runtime.lastError),a&&a.hasOwnProperty(g))console.log("notify","we know its a thing, update complete",b,a,c),console.log("notify",!a,!a.hasOwnProperty(g)),console.log("warn","about to DO scap",a),"complete"==b.status&&(tabEvent(g,"updated"),screenCap(c));else{console.log("warn","WARNING: update, couldnt find thing"),console.log("notify","updated about to set:",g,a.url,"======");var d={};d[c.id]=c.url,d["screencap-"+c.id]="",d["screencap-url-"+c.id]="",lsSet(d,function(){console.log("notify","ls is set, let's do the screencap",a),tabEvent(g,"pre-update"),screenCap(c)})}})}else console.log("warn","WARNING: update: not correct protocol",c),console.log("warn","protocol:",e,"hostname",f)},screenCap=function(a){var b="screencap-url-"+a.id;lsGet(b,function(c){if(console.log("warn","OUR RESULT",c),!c||!c.hasOwnProperty(b))return console.log("warn","we couldnt find this screencap record:",b,tabId,a),!1;var d=c[b];if(a.url==d)return console.log("notify","we already took this cap:",c),!1;var e={currentWindow:!0,windowId:a.windowId,active:!0,status:"complete"};tabQuery(e,function(b){console.log("notify","screencap: ",c,b,a,"----------"),b.id==a.id&&b.windowId==a.windowId&&d!=b.url&&-1===DISALLOWED_SCREENCAP_URLS.indexOf(b.url)?generateScreenCap(b.windowId,{format:"png"},function(c){var d=document.createElement("canvas"),e=d.getContext("2d");d.width=THUMBSIZE,d.height=THUMBSIZE;var f=document.createElement("img");f.onload=function(){var g,h,i=THUMBSIZE/SCREEN_CROP_RATIO;this.height<this.width?(g=i,h=i*(this.width/this.height)):(h=i,g=i*(this.height/this.width));var j="screencap-"+a.id,k={};console.log("notify","screencap about to set:",j,g,h,"======"),e.clearRect(0,0,d.width,d.height),e.drawImage(this,0,0,h,g),k[j]=d.toDataURL(),k["screncap-url-"+a.id]=b.url,lsSet(k,function(){tabEvent(a.id,"screencap"),console.log("notify","screencap done"),d=void 0,e=void 0}),f=void 0,c=void 0},f.src=c}):console.log("notify","NOTIFY: no active window found for this event")})})},tabActivated=function(a){var b=a.tabId;lsGet(b,function(a){a&&null!==a&&a.hasOwnProperty(b)?(console.log("warn","about to try screencap in activated",a),tabEvent(b,"activated"),getTab(b,function(a){console.log("error","WUUUTT, result",a),a&&"undefined"!=typeof a.id&&screenCap(a)})):console.log("warn","tab activated but not found in ls",a)})},tabRemoved=function(a){a===OVERTAB_TAB_ID?(OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,lsSet({OVERTAB_TAB_ID:null,OVERTAB_WINDOW_ID:null})):lsRemove(a,function(){tabEvent(a,"removed")})},onMessage=function(a){console.log("notify","message request:",a)},openOverTab=function(){lsGet("OVERTAB_OPEN_FUNC",function(a){a&&"undefined"!=typeof a.OVERTAB_OPEN_FUNC||(a=OVERTAB_DEFAULT_OPEN_FUNC);var b={url:getExtensionUrl()};a(b,function(a){OVERTAB_TAB_ID=a.id,OVERTAB_WINDOW_ID=a.windowId,lsSet({OVERTAB_TAB_ID:OVERTAB_TAB_ID,OVERTAB_WINDOW_ID:OVERTAB_WINDOW_ID})})})},browserActionClick=function(){null===OVERTAB_TAB_ID||null===OVERTAB_WINDOW_ID?lsGet("OVERTAB_TAB_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_TAB_ID")&&null!==a.OVERTAB_TAB_ID?(OVERTAB_TAB_ID=a,getTab(a,function(a){console.log("error","browsertabaction tab get",a),a&&"undefined"!=typeof a.id?lsGet("OVERTAB_WINDOW_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_WINDOW_ID")&&null!==a.OVERTAB_WINDOW_ID?(OVERTAB_WINDOW_ID=a,tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID)):openOverTab()}):openOverTab()})):openOverTab()}):tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID)},tabReplaced=function(){console.log("warn","ERROR: a tab was replaced")},startup=function(){console.log("notify","startup")},shutdown=function(){console.log("notify","shutdown")},install=function(a){chrome.storage.local.clear(),console.log("notify","installed",a.reason,a.previousVersion)};chrome.runtime.onStartup.addListener(startup),chrome.runtime.onSuspend.addListener(shutdown),chrome.runtime.onInstalled.addListener(install);var defaultOpener=chrome.tabs.create,getExtensionUrl=function(){return chrome.extension.getURL("index.html")};chrome.runtime.onMessage.addListener(onMessage);var generateScreenCap=function(a,b,c){return console.log("notify","gen screen cap"),chrome.tabs.captureVisibleTab(a,b,c)};chrome.tabs.onCreated.addListener(tabCreated),chrome.tabs.onUpdated.addListener(tabUpdated),chrome.tabs.onActivated.addListener(tabActivated),chrome.tabs.onRemoved.addListener(tabRemoved),chrome.browserAction.onClicked.addListener(browserActionClick),chrome.tabs.onReplaced.addListener(tabReplaced),chrome.runtime.onSuspend.addListener(function(){copnsole.log("notify","suspended")}),chrome.runtime.onSuspendCanceled.addListener(function(){copnsole.log("notify","suspend cancelled")});var tabQuery=function(a,b){return chrome.tabs.query(a,function(c){c&&c.length>0&&c[0].id?b(c[0]):(console.log("WARNING: your tab query failed",a,c),b(!1))})},tabsQuery=function(a,b){return chrome.tabs.query(a,b)},getTab=function(a,b){return chrome.tabs.get(a,b)},tabFocus=function(a,b){chrome.windows.update(b,{focused:!0},function(){chrome.tabs.update(a,{active:!0},function(){})})},sendMessage=function(a,b,c){return chrome.runtime.sendMessage(a,b,c)},lsGet=function(a,b){console.log("notify","local storage  get: ",a),chrome.storage.local.get(String(a),b)},lsSet=function(a,b){console.log("notify","local storage  set: ",a),chrome.storage.local.set(a,b)},lsRemove=function(a,b){if("function"==typeof b){var c=String(a);chrome.storage.local.remove([c,"screencap-"+c,"screencap-url-"+c],b)}else console.log("warn","lsremove callback not defined",b)};