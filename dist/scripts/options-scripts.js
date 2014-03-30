"use strict";

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        CONVINIENCE CLASSES             ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var LOG_LEVEL = "vvv";

var logger = console.log;

console.log = function(){
  //argument types:
  //  vvv:
  //    notify, warn, errors
  //  vv:
  //    warn, errors
  //  v:
  //    errors
  //  production:
  //    log errors to google analytics

  if( arguments.length >= 2 ){
    var type = arguments[0];

    switch( LOG_LEVEL ){
      case "production":
        //do some google analytics error reporting
        break;
      case "v":
        if( type == "errors" ){
          logger.apply( this, arguments );
        }
        break;
      case "vv":
        if( type == "errors" || type == "warn" ){
          logger.apply( this, arguments );
        }
        break;
      case "vvv":
        logger.apply( this, arguments );
        break;
    }
  }
};

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
    if( this[i].hasOwnProperty( key ) && this[i][key] == val ){
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
    if( this[i].hasOwnProperty( key ) && this[i][key] === val ){
      return i;
    }
  }

  return false;
};

var DISALLOWED_SCREENCAP_URLS = [
  "chrome://newtab/"
];

var ALLOWED_PROTOCOLS = [
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
function rangeConstrict(num ){

  var min1 = 1,
    max1 = 42,
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

//query for a single tab
var tabQuery = function( queryInfo, callback ){
  return chrome.tabs.query( queryInfo, function( tabs ){
    if (tabs && tabs.length > 0 && tabs[0].id) {
        callback(tabs[0]);
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
        //send a message with this thing
        tabEvent( oldTabId, "overtab" );
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
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     END SHARED CHROME INTERACTION      ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

"use strict";

var setMessageListener = function( callback ){
  //chrome.runtime.onMessage.addListener( $scope.onMessage );
  chrome.runtime.onMessage.addListener( callback );
};

var closeTab = function( tabId ){
  chrome.tabs.remove( tabId, function() {
    //what should we do here
  });
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

      var value = $(elem).val();

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
