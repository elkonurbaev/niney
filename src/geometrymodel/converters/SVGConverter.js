function SVGConverter() {}

SVGConverter.prototype.pointsToSVGPoints = function(bounds, centerScale, points) {
    if (points == null) {
        return "";
    }
    
    var svgPoints = "";
    for (var i = 0; i < points.length; i++) {
        var x = centerScale.getPixX(bounds.width, points[i].x);
        var y = centerScale.getPixY(bounds.height, points[i].y);
        svgPoints += x + "," + y + " ";
    }
    return svgPoints;
}

