var overtabApp = angular.module('app', [])
    .filter('domainExtraction', domainExtractionFilter)
    .controller('mainController', ['$scope', '$injector', mainController])
