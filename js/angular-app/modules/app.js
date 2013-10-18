var overtabApp = angular.module('overtab', [])
    overtabApp.config(['$filterProvider',
        function ($filterProvider) {

            //lets expose the provider to the module!
            overtabApp.register = {};
            overtabApp.register.filter = $filterProvider.register;
        }])
    .filter('domainExtraction', domainExtractionFilter)
    .controller('mainController', ['$scope', '$filter', mainController])
