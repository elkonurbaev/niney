function GeometryTools() { }

GeometryTools.getGeometryClass = function(geometryType) {
    geometryType = geometryType.toUpperCase();
    if (geometryType == "POINT") {
        return Point;
    } else if (geometryType == "ENVELOPE") {
        return Envelope;
    } else if (geometryType == "CIRCLE") {
        return Circle;
    } else if (geometryType == "LINESTRING") {
        return LineString;
    } else if (geometryType == "POLYGON") {
        return Polygon;
    }
    return null;
}

GeometryTools.transform = function(geometry, srid) {
    if (geometry == null) {
        alert("No geometry given.");
    }
    if (!(geometry instanceof Point)) {
        alert("Given geometry is not a point. Only point geometries are currently supported.");
    }
    var point = geometry;
    
    if ((point.srid == 4326) && (srid == 900913)) {
        var x = point.x * 20037508.3427892 / 180;
        var y = Math.log(Math.tan((90 + point.y) * Math.PI / 360)) * 180 / Math.PI;
        y = y * 20037508.3427892 / 180;
        point = new Point(x, y);
        point.srid = srid;
        return point;
    } else if ((point.srid == 900913) && (srid == 4326)) {
        var x = point.x * 180 / 20037508.3427892;
        var y = point.y * 180 / 20037508.3427892;
        y = Math.atan(Math.exp(y / 180 * Math.PI)) * 360 / Math.PI - 90;
        point = new Point(x, y);
        point.srid = srid;
        return point;
    }
    
    alert("Given SRID transformation is currently not supported.");
}
