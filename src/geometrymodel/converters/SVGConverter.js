export function SVGConverter() { }

SVGConverter.prototype.pathToGeometry = function(path) {
    var points = [];
    var pointStrings = path.replace(/^M *| +Z.*$/g, "").split(/ +[KL] */);  // Converts the first linestring only, because it is hard to determine whether subsequent linestrings are interior or exterior.
    for (var i = 0; i < pointStrings.length; i++) {
        var coordStrings = pointStrings[i].split(" ");
        points.push(new Point(parseFloat(coordStrings[0]), parseFloat(coordStrings[1])));
    }
    if (points.length == 1) {
        return points[0];
    }
    if (!points[0].equals(points[points.length - 1])) {
        return new LineString(points);
    }
    return new Polygon([new LineString(points)]);
}

SVGConverter.prototype.geometryToPixPath = function(bounds, centerScale, geometry) {
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

SVGConverter.prototype.geometryToWorldPath = function(geometry) {
    var path = "";
    var lineStrings = geometry.getLineStrings();
    for (var i = 0; i < lineStrings.length; i++) {
        path += "M ";
        var points = lineStrings[i].getPoints();
        for (var j = 0; j < points.length; j++) {
            if (j == 1) {
                path += "L ";
            }
            path += points[j].x + " " + points[j].y + " ";
        }
    }
    return path;
}

