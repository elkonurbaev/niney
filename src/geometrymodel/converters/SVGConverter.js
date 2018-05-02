function SVGConverter() { }

SVGConverter.prototype.geometryToPath = function(bounds, centerScale, geometry) {
    var path = "";
    var lineStrings = geometry.getLineStrings();
    for (var i = 0; i < lineStrings.length; i++) {
        path += "M ";
        var points = lineStrings[i].getPoints();
        for (var j = 0; j < points.length; j++) {
            if (j == 1) {
                path += "L ";
            }
            var x = centerScale.getPixX(bounds.width, points[j].x);
            var y = centerScale.getPixY(bounds.height, points[j].y);
            path += x + " " + y + " ";
        }
    }
    return path;
}

