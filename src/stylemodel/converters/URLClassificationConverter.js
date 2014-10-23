function URLClassificationConverter() { }

URLClassificationConverter.classificationToURLClassification = function(classification) {
    var urlClassification = classification.propertyName + "::";
    
    urlClassification += classification.numClasses + "::";
    
    if (classification.colors != null) {
        var colorString = null;
        for (var i = 0; i < classification.colors.length; i++) {
            colorString = classification.colors[i].toString(16).toUpperCase();
            while (colorString.length < 6) {
                colorString = "0" + colorString;
            }
            colorString = "#" + colorString;
            
            urlClassification += colorString;
            if (i < classification.colors.length - 1) {
                urlClassification += ":";
            }
            
            if (classification.numbers != null) {
                urlClassification += "::";
            }
        }
    }
    if (classification.numbers != null) {
        for (var j = 0; j < classification.numbers.length; j++) {
            urlClassification += classification.numbers[j];
            if (j < classification.numbers.length - 1) {
                urlClassification += ":";
            }
        }
    }
    
    return urlClassification;
}

