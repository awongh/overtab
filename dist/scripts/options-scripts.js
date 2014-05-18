"use strict";

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        CONVINIENCE CLASSES             ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)){ size++; }
  }
  return size;
};

Array.prototype.remove = function(from) {
    return this.splice(from, 1);
};

Array.prototype.add = function(from, item) {
    if( !item ){
      throw "Trying to add a null variable to array. -oops";
    }

    return this.splice(from, 0, item);
};

Array.prototype.hasValue = function( val ){

  if( this.indexOf( val )  === -1 ){
    return false;
  }

  return true;

};

Array.prototype.removeValue = function( val ){

  var i = this.indexOf( val );

  if( i  === -1 ){
    return false;
  }

  return this.remove( i );
};

//WARNING, can't be looking for value of -1 in this array!!!
Array.prototype.getByValue = function( val ){
  var i = this.indexOf( val );

  if( i !== -1 ){
    return this[i];
  }

  return false;
};

Array.prototype.getByValueProperty = function( key, val ){
  for( var i=0; i < this.length; i++){
    if( this[i] && this[i].hasOwnProperty( key ) && this[i][key] == val ){
      return this[i];
    }
  }

  return false;
};

Array.prototype.hasValueProperty = function( key, val ){
  if( this.getByValueProperty( key, val ) === false ){
    return false;
  }

  return true;
};

Array.prototype.valuePropertyIndex = function( key, val ){
 for( var i=0; i < this.length; i++){
    if( this[i] && this[i].hasOwnProperty( key ) && this[i][key] === val ){
      return i;
    }
  }

  return false;
};

//calculate an integer average given an array of numbers
Array.prototype.intAverage = function(){
  var total = 0;
  var length = 0;
  for( var i=0; i<this.length; i++ ){
    if( typeof this[i] == "number" ){
      length++;
      total += this[i];
    }
  }

  return Math.round( total/length );
}

var DISALLOWED_SCREENCAP_URLS = [
  "chrome://newtab/"
];

var ALLOWED_PROTOCOLS = [
  "file:",
  "http:",
  "https:",
  "chrome:"
];

var Parser = function(){
  this.parser = document.createElement('a');
};

Parser.prototype = {
  href : function( href ){
    this.parser.href = href;
    return this;
  },

  protocol : function(){
    return this.parser.protocol;
  },

  hostname : function(){
    return this.parser.hostname;
  },

  port : function(){
    return this.parser.port;
  },

  pathname : function(){
    return this.parser.pathname;
  },

  search : function(){
    return this.parser.search;
  },

  hash : function(){
    return this.parser.hash;
  },

  host : function(){
    return this.parser.host;
  }
};

var stringToInt = function( str ){
  var retInt = 0,
    scale = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    word = str.toUpperCase();

  for( var i=0; i < word.length; i++ ){
    retInt += scale.indexOf( word[i] );
  }

  return retInt;
};

//make the domainInt a number in the range
//of colors we've specified
function rangeConstrict( num ){
  //max1 == number of colors
  //max2 == given spec, possible maximum of url stringtoint given <2048 chars
  //http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers

  var min1 = 1,
    max1 = 61,
    min2 = 1,
    max2 = 1638;

  var num1 = (num - min1) / (max1 - min1);
  var num2 = (num1 * (max2 - min2)) + min2;

  //golden ratio is .6...
  //this evenly distributes the numbers b/c most will not
  //be anywhere near 1638
  num2 += 0.618033988749895;
  return Math.abs( Math.round( num2 %= max1 ) );
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      END CONVINIENCE CLASSES           ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

"use strict";

//options array
//define the possible values in the options checker, inside of background
var options = [
  //values: tab, window
  {
    name : "opener",
    type : "radio"
  },
  {
    name : "analytics",
    type : "checkbox"
  }



  //example other kinds of inputs for options
  //name == class on individual
  /*

  {
    name : "test4",
    type : "select"
  },
  { name: "test3", type:"text" }

  */
];

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      SHARED CHROME INTERACTION         ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var getTabCount = function( callback ){

  tabsQuery({}, function(result) {

    var count = 0;

    for( var i = 0; i< result.length; i++ ){
      if( isVerifiedTabUrl( result[i] ) ){
        count++;
      }
    }

    callback( count );
  });
};

//make sure it's a real tab, not dev-tools, or something
var isVerifiedTabUrl = function( tab ){
  if( tab.hasOwnProperty( "url" ) ){
    var parser = new Parser();

    var tabProtocol = parser.href(tab.url).protocol();
    var hostName = parser.href(tab.url).hostname();

    //what conditions do we want to accept add adding a tab?
    if (
      tab.hasOwnProperty( "id" )
      && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1
      && !isExtensionUrl( tab.url ) )
    {
      return true;
    }
  }

  return false;
};

var isExtensionUrl = function( url ){
  if( url == extensionUrl("index.html") || url == extensionUrl("options.html") ){
    return true;
  }

  return false;
};

var extensionUrl = function( path ){
  return chrome.extension.getURL( path );
};

//query for a single tab
var tabQuery = function( queryInfo, callback ){
  chrome.tabs.query( queryInfo, function( tabs ){

    //this is a hack for when a dev window is open...
    //make sure we can find one good tab
    var rtabs = [],
      i=0;

    do{
      if (tabs[i] && tabs[i].id) {
        rtabs.push( tabs[i] );
      }
      i++;
    }while (i < tabs.length && !isVerifiedTabUrl( tabs[i] ) );

    if (rtabs.length > 0 ) {
        callback(rtabs[0]);
    }else{
      //console.log( "warn", "WARNING: your tab query failed", queryInfo, tabs );
      callback(false);
    }
  });
};

var tabsQuery = function( queryInfo, callback ){
  return chrome.tabs.query( queryInfo, callback );
};

//get a tab by id
var getTab = function( tabId, callback ){
  return chrome.tabs.get( tabId, callback );
};

//bring a tab into focus
var tabFocus = function( tabId, windowId, oldTabId ){
    chrome.windows.update(windowId, {'focused': true}, function() {
      chrome.tabs.update(tabId, {'active': true}, function() {
        //message the thing to say the tab
        if( oldTabId ){
          tabEvent( oldTabId, "overtab" );
        }
      });
    });
};

var tabEvent = function( id, message ){
  sendMessage(null, {message: message, id: id});
}

//send message
var sendMessage = function( tabId, message, callback ){
  return chrome.runtime.sendMessage( tabId, message, callback );
};

var lsGet = function( id, callback ){
  chrome.storage.local.get( String( id) , callback );
};

var lsSet = function( thing, callback ){
  chrome.storage.local.set( thing, callback );
  thing = undefined;
};

var lsRemove = function( tabId, callback ){
  if( typeof callback === "function" ){
    var id = String( tabId );
    chrome.storage.local.remove( [ id, "screencap-"+id, "screencap-url-"+id ], callback );
  }else{
    //what do we want to do here???
    //console.log( "warn", "lsremove callback not defined", callback );
  }
};

var chromeBadge = function( text ){
  chrome.browserAction.setBadgeText( {text: String(text)} );
};

var closeTab = function( tabId ){
  chrome.tabs.remove( tabId, function() {
    //what should we do here
  });
};
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     END SHARED CHROME INTERACTION      ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////            GET OVERTAB TAB ID          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var getOvertabId = function( callback ){
  var query = {
    url: extensionUrl('index.html')
  };

  tabQuery(query, function(tab) {

    if( tab ){
      callback( tab );
    }else{
      callback( false );
    }
  });
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////          END GET OVERTAB TAB ID        ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     CHROME MEMORY DEV STUFF            ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var getMemory = function(){
  chrome.system.memory.getInfo(function(info){
    var availableCapacity = info.availableCapacity, capacity = info.capacity;
    //console.log( "available: "+availableCapacity, "total: "+capacity );
    //console.log( "available: "+availableCapacity );

    if( availableCapacity < 21000000 ){
      alert( "about to run out of memory" );
    }

    if( OVERTAB_TAB_ID ){

      chrome.processes.getProcessIdForTab(OVERTAB_TAB_ID, function(processId){

        var pId = processId;

        chrome.processes.getProcessInfo(processId, true, function(processes){

          var ps = [];

          for( var i in processes ){
            if( processes.hasOwnProperty(i) ){
              ps.push( processes[i] );
            }
          }

          var process = ps[0];

          //console.log( "using:" + process.privateMemory );

        /*
          console.log( "process"
           , process.id
           , process.privateMemory
           , process.osProcessId
           , process.tabs.length
           , process.title
           , process.type
          );
         */
        });
      });

    }
  });
};

"use strict";

var setMessageListener = function( callback ){
  //chrome.runtime.onMessage.addListener( $scope.onMessage );
  chrome.runtime.onMessage.addListener( callback );
};

"use strict";

function saveNotification(){
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

function setAllOptions(){

  //go through each option and set it in local storage
  //we expect that each distict option has a class name

  for( var index in options ){

    if( !options.hasOwnProperty( index ) ){
      continue;
    }
    //store it under name
    var name = options[index].name;
    var type = options[index].type;

    var c = $("."+name);

    var elem;

    //in case we have an element that has multiple inputs per value

    if( type === "radio" || type === "checked" ){
      //get the checked one
      elem = $(c).closest( "input:checked" );
      //make sure we have a real result
    }else if( type === "select" ){
      elem = $(c).closest( ":selected" );
    }else{
      elem = c[0];
    }

    //set the elem to the name
    if( elem ){

      var value = false;

      if( type == "checkbox" ){
        value = elem.checked;
      }else{
        value = $(elem).val();
      }

      var setObj = {};

      setObj[name] = value;

      lsSet( setObj, function(){
        var i = index;
        return function(){
          //this would work better in a promise and not a closure!!!
          if( ++i == options.length ){
            saveNotification();
          }
        };
      }());
    }else{
      //we couldn't find the html element for this option
    }
  }
}

// Saves options to localStorage.
function save_options() {

  //call all the things separetely
  setAllOptions();
}

function restore_options() {

  for( var index in options ){

    if( !options.hasOwnProperty( index ) ){
      continue;
    }

    var option = options[index];

    lsGet( option.name, function(){
      var opt = option;

      return function( result ){

        if( !result || !result.hasOwnProperty( opt.name ) ) { return; }

        var value = result[opt.name];

        //try to set the thing
        switch( opt.type ){
          //get the thing with the value we set
          case "checkbox":
            var selector = "."+opt.name;

            $(selector).prop( "checked", value );
            break;
          case "radio":
            var selector = "."+opt.name+"[value='"+value+"']";
            $(selector).prop( "checked", true );

            break;


          case "select":
            var selector = "."+opt.name+"[value='"+value+"']";
            $(selector).prop( "selected", true );

            break;

          case "text":

            var selector = "."+opt.name;
            $(selector).val( value );

            break;
        }
      };
    }());
  }

}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
