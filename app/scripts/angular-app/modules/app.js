"use strict";

var overtabApp = angular.module('overtab', ['siyfion.sfTypeahead']);

overtabApp.config(function($filterProvider, $compileProvider){

    //lets expose the provider to the module!
    overtabApp.register = {};
    overtabApp.register.filter = $filterProvider.register;

    //make sure angular can get chrome stuff
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|data|mailto|chrome-extension):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
})
.filter('tabFilter', tabFilter)
.controller('mainController', ['$scope', '$rootScope', '$timeout', '$filter', mainController])
.directive('onLastRepeat', onLastRepeat);
