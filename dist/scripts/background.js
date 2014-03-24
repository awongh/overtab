"use strict";function rangeConstrict(a){var b=1,c=42,d=1,e=1638,f=(a-b)/(c-b),g=f*(e-d)+d;return g+=.618033988749895,Math.abs(Math.round(g%=c))}var LOG_LEVEL="vvv",logger=console.log;console.log=function(){if(arguments.length>=2){var a=arguments[0];switch(LOG_LEVEL){case"production":break;case"v":"errors"==a&&logger.apply(this,arguments);break;case"vv":("errors"==a||"warn"==a)&&logger.apply(this,arguments);break;case"vvv":logger.apply(this,arguments)}}},Object.size=function(a){var b,c=0;for(b in a)a.hasOwnProperty(b)&&c++;return c},Array.prototype.remove=function(a){return this.splice(a,1)},Array.prototype.add=function(a,b){if(!b)throw"Trying to add a null variable to array. -oops";return this.splice(a,0,b)},Array.prototype.hasValue=function(a){return-1===this.indexOf(a)?!1:!0},Array.prototype.removeValue=function(a){var b=this.indexOf(a);return-1===b?!1:this.remove(b)},Array.prototype.getByValue=function(a){var b=this.indexOf(a);return-1!==b?this[b]:!1},Array.prototype.getByValueProperty=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]==b)return this[c];return!1},Array.prototype.hasValueProperty=function(a,b){return this.getByValueProperty(a,b)===!1?!1:!0},Array.prototype.valuePropertyIndex=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]===b)return c;return!1};var DISALLOWED_SCREENCAP_URLS=["chrome://newtab/"],ALLOWED_PROTOCOLS=["http:","https:","chrome:"],Parser=function(){this.parser=document.createElement("a")};Parser.prototype={href:function(a){return this.parser.href=a,this},protocol:function(){return this.parser.protocol},hostname:function(){return this.parser.hostname},port:function(){return this.parser.port},pathname:function(){return this.parser.pathname},search:function(){return this.parser.search},hash:function(){return this.parser.hash},host:function(){return this.parser.host}};var stringToInt=function(a){for(var b=0,c="ABCDEFGHIJKLMNOPQRSTUVWXYZ",d=a.toUpperCase(),e=0;e<d.length;e++)b+=c.indexOf(d[e]);return b},options=[{name:"opener",type:"radio"}],tabQuery=function(a,b){return chrome.tabs.query(a,function(a){b(a&&a.length>0&&a[0].id?a[0]:!1)})},tabsQuery=function(a,b){return chrome.tabs.query(a,b)},getTab=function(a,b){return chrome.tabs.get(a,b)},tabFocus=function(a,b,c){chrome.windows.update(b,{focused:!0},function(){chrome.tabs.update(a,{active:!0},function(){tabEvent(c,"overtab")})})},tabEvent=function(a,b){sendMessage(null,{message:b,id:a})},sendMessage=function(a,b,c){return chrome.runtime.sendMessage(a,b,c)},lsGet=function(a,b){chrome.storage.local.get(String(a),b)},lsSet=function(a,b){chrome.storage.local.set(a,b)},lsRemove=function(a,b){if("function"==typeof b){var c=String(a);chrome.storage.local.remove([c,"screencap-"+c,"screencap-url-"+c],b)}};chrome.commands.onCommand.addListener(function(a){console.log("Command:",a)});var THUMBSIZE=150,SCREEN_CROP_RATIO=1,OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,tabCreated=function(a){{var b=new Parser,c=b.href(a.url).protocol();b.href(a.url).hostname()}if("undefined"!=typeof a.id&&-1!==ALLOWED_PROTOCOLS.indexOf(c)&&a.id!=OVERTAB_TAB_ID){var d={};d[a.id]=a.url,d["screencap-"+a.id]="",d["screencap-url-"+a.id]="",lsSet(d,function(){tabEvent(a.id,"created")})}else console.log("error","ERROR: something happened on create:",a)},tabUpdated=function(a,b,c){{var d=new Parser,e=d.href(c.url).protocol();d.href(c.url).hostname()}if("undefined"!=typeof c.id&&-1!==ALLOWED_PROTOCOLS.indexOf(e)&&a!=OVERTAB_TAB_ID){var f=c.id;lsGet(f,function(a){if(a&&a.hasOwnProperty(f))"complete"==b.status&&(tabEvent(f,"updated"),screenCap(c));else{var d={};d[c.id]=c.url,d["screencap-"+c.id]="",d["screencap-url-"+c.id]="",lsSet(d,function(){tabEvent(f,"pre-update")})}})}else console.log("warn","WARNING: update: not correct protocol",e,c,a)},screenCap=function(a){var b="screencap-url-"+a.id;lsGet(b,function(c){if(!c||!c.hasOwnProperty(b))return console.log("warn","we couldnt find this screencap record:",b,tabId,a),!1;var d=c[b];if(a.url==d)return!1;var e={currentWindow:!0,windowId:a.windowId,active:!0,status:"complete"};tabQuery(e,function(b){b.id==a.id&&b.windowId==a.windowId&&d!=b.url&&-1===DISALLOWED_SCREENCAP_URLS.indexOf(b.url)?generateScreenCap(b.windowId,{format:"png"},function(c){var d=document.createElement("canvas"),e=d.getContext("2d");d.width=THUMBSIZE,d.height=THUMBSIZE;var f=document.createElement("img");f.onload=function(){var c,f,g=THUMBSIZE/SCREEN_CROP_RATIO;this.height<this.width?(c=g,f=g*(this.width/this.height)):(f=g,c=g*(this.height/this.width));var h="screencap-"+a.id,i={};e.clearRect(0,0,d.width,d.height),e.drawImage(this,0,0,f,c),i[h]=d.toDataURL(),i["screencap-url-"+a.id]=b.url,lsSet(i,function(){tabEvent(a.id,"screencap")}),d=void 0,e=void 0},f.src=c,c=void 0,f=void 0}):console.log("warn","screencap: no active window found >> result: "+b.id+" tab: "+a.id+" old url: "+d)})})},tabActivated=function(a){var b=a.tabId;lsGet(b,function(a){a&&null!==a&&a.hasOwnProperty(b)?(tabEvent(b,"activated"),getTab(b,function(a){a&&"undefined"!=typeof a.id&&screenCap(a)})):console.log("warn","tab activated but not found in ls: tabid: "+b,a)})},tabRemoved=function(a){a===OVERTAB_TAB_ID?(OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,lsSet({OVERTAB_TAB_ID:null,OVERTAB_WINDOW_ID:null})):lsRemove(a,function(){tabEvent(a,"removed")})},onMessage=function(){},openOverTab=function(a){lsGet("opener",function(b){var c,d=b.opener,e={url:getExtensionUrl()};switch(d){case"window":e.focused=!0,c=chrome.windows.create;break;default:e.active=!0,c=chrome.tabs.create}c(e,function(b){if(b.hasOwnProperty("tabs")&&b.tabs.length>0){var c=b.tabs.getByValueProperty("active",!0);if(!c)return void console.log("error","we couldnt find an active tab in the return value");b=c}OVERTAB_TAB_ID=b.id,OVERTAB_WINDOW_ID=b.windowId,lsSet({OVERTAB_TAB_ID:OVERTAB_TAB_ID,OVERTAB_WINDOW_ID:OVERTAB_WINDOW_ID}),tabEvent(a,"overtab")})})},browserActionClick=function(){var a={active:!0};tabQuery(a,function(a){var b=0;if(a)var b=a.id;null===OVERTAB_TAB_ID||null===OVERTAB_WINDOW_ID||"undefined"===OVERTAB_TAB_ID||"undefined"===OVERTAB_WINDOW_ID?lsGet("OVERTAB_TAB_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_TAB_ID")&&null!==a.OVERTAB_TAB_ID?(OVERTAB_TAB_ID=a.OVERTAB_TAB_ID,getTab(a.OVERTAB_TAB_ID,function(a){a&&"undefined"!=typeof a.id?lsGet("OVERTAB_WINDOW_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_WINDOW_ID")&&null!==a.OVERTAB_WINDOW_ID?(OVERTAB_WINDOW_ID=a.OVERTAB_WINDOW_ID,tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID,b)):openOverTab(b)}):openOverTab(b)})):openOverTab(b)}):tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID,b)})},getAllTabs=function(){lsGet("OVERTAB_TAB_ID",function(a){var b=null;a.hasOwnProperty("OVERTAB_TAB_ID")&&(b=a.OVERTAB_TAB_ID);var c=new Parser;tabsQuery({},function(a){for(var d=0;d<a.length;d++){{var e=a[d],f=c.href(e.url).protocol();c.href(e.url).hostname()}"undefined"!=typeof e.id&&-1!==ALLOWED_PROTOCOLS.indexOf(f)&&e.id!=b&&"complete"===e.status&&tabCreated(e)}})})},tabReplaced=function(a,b){console.log("warn","WARN: XXXXXXX a tab was replaced"),lsGet(b,function(c){if(c&&!c.hasOwnProperty(id)){var d={};d[a]=c.url,d["screencap-"+a]="",d["screencap-url-"+a]="",lsSet(d,function(){sendMessage(null,{message:"replaced",id:a,oldId:b})})}else console.log("warn","couldnt find tab on replace")})},startup=function(){chrome.storage.local.clear(),console.log("notify","startup"),getAllTabs()},shutdown=function(){chrome.storage.local.clear(),console.log("notify","shutdown")},install=function(a){chrome.storage.local.clear(),getAllTabs(),console.log("notify","installed",a.reason,a.previousVersion)};chrome.runtime.onStartup.addListener(startup),chrome.runtime.onSuspend.addListener(shutdown),chrome.runtime.onInstalled.addListener(install);var getExtensionUrl=function(){return chrome.extension.getURL("index.html")};chrome.runtime.onMessage.addListener(onMessage);var generateScreenCap=function(a,b,c){return chrome.tabs.captureVisibleTab(a,b,c)};chrome.tabs.onCreated.addListener(tabCreated),chrome.tabs.onUpdated.addListener(tabUpdated),chrome.tabs.onActivated.addListener(tabActivated),chrome.tabs.onRemoved.addListener(tabRemoved),chrome.browserAction.onClicked.addListener(browserActionClick),chrome.tabs.onReplaced.addListener(tabReplaced),chrome.runtime.onSuspend.addListener(function(){console.log("notify","suspended")}),chrome.runtime.onSuspendCanceled.addListener(function(){console.log("notify","suspend cancelled")});var getCurrentTab=function(a){chrome.tabs.getCurrent(a)};