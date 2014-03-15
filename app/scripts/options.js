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

    if( options.hasOwnProperty( index ) ){

      //store it under name
      var name = options[index].name;

      var c = $("."+name);

      var elem;

      //in case we have an element that has multiple inputs per value
      if( c.length > 1 ){
        //some kind of thing
        var type = $( c[0] ).attr( "type" );

        if( type === "radio" || type === "checked" ){
          //get the checked one
          elem = $(c).closest( "input:checked" );
          //make sure we have a real result
        }

      }else{
        var elem = c[0];
      }

      //set the elem to the name
      if( elem ){

        var value = $(elem).val();

        //console.log( "warn", "SETTING: "+value);

        lsSet( { name : elem }, function(){
          //something???
          //do the next thing i guess
        });

      }
    }
  }
}

function setOpener( val ){
  var opener = $( "input:checked" ).val();

  if( options.opener.indexOf( opener ) !== -1 ){
    lsSet( { "opener" : opener }, function(){
      //
      //
    });
  }
}

// Saves options to localStorage.
function save_options() {

  //call all the things separetely
  setAllOptions();
}

function restore_options() {
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
