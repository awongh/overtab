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
