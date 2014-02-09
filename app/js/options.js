"use strict";

// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("color");

  var input = document.getElementById("open-as-window");

  //get it
  var windowOption = input.value;

  localStorage.windowOption = windowOption;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

function restore_options() {

  var windowOption = localStorage.windowOption;

  if (!windowOption) {
    return;
  }

  var input = document.getElementById("window-as-option");

  input.value = windowOption;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
