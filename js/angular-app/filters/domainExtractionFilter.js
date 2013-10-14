var domainExtractionFilter = function() {
    return function(uri) {
        if (str == null || str.length == 0)
            return "";
        
        str = cleanURL(str).toLowerCase();
        
        var i = str.indexOf("/");
        if (i > -1)
            str = str.substring(0, i);
            
        var parts = str.split('.');
        
        var len = parts.length;
        
        if (len < 3)
            return str;

        var lastPart = parts[len-1];
        var secondPart;
                
        secondPart = parts[len-2];
        
        var two = 2;
        
        if (lastPart == "uk" && secondPart == "co")
            ++two;
        
        if (len >= 0)
            return parts.splice(len-two, two).join('.');
        
        return "";
    }
}
