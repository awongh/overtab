"use strict";

var domainExtractionFilter = function() {
    return function(uri) {
        var domainSplits = uri.split('//'),
            protocol = domainSplits[0],
            dir;

        switch (protocol) {
            case 'file:':
                dir = domainSplits[1].split('/');
                dir.shift();
                dir.pop();
                return dir.join('/');
            default:
                return domainSplits[1].split('/')[0];
        }
    };
};
