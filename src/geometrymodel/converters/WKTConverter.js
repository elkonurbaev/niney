export function WKTConverter() {
    this.sridRegExp = /^"?SRID=(\d+);(.*)/;
    this.geometryCollectionRegExp = /^"?GEOMETRYCOLLECTION\s?\((.*?)\)"?$/;
    this.multiGeometryRegExp = /^"?MULTI(POINT|LINESTRING|POLYGON)\s?\((.*?)\)"?$/;
    this.pointRegExp = /^"?POINT\s?\(([-\d\s\.]*)\)"?$/;
    this.lineStringRegExp = /^"?LINESTRING\s?\(([-\d\s\.,]*)\)"?$/; 
    this.polygonRegExp = /^"?POLYGON\s?\(([-\d\s\.,\(\)]*)\)"?$/;
}

WKTConverter.prototype.wktToGeometry = function(wkt) {
    var sridString = null;
    if (wkt.search(this.sridRegExp) == 0) {
        sridString = wkt.replace(this.sridRegExp, "$1");
        wkt = wkt.replace(this.sridRegExp, "$2");
    }
    
    var geometry = null;
    if (wkt.search(this.geometryCollectionRegExp) == 0) {
        geometry = this.wktToGeometryCollection(wkt);
    } else if (wkt.search(this.multiGeometryRegExp) == 0) {
        geometry = this.wktToMultiGeometry(wkt);
    } else if (wkt.search(this.pointRegExp) == 0) {
        geometry = this.wktToPoint(wkt);
    } else if (wkt.search(this.lineStringRegExp) == 0) {
        geometry = this.wktToLineString(wkt);
    } else if (wkt.search(this.polygonRegExp) == 0) {
        geometry = this.wktToPolygon(wkt);
    }
    
    if ((geometry != null) && (sridString != null) && (sridString != "") && (sridString != "900913")) {
        geometry.srid = parseInt(sridString);
        geometry = GeometryTools.transform(geometry, 900913);
    }
    
    return geometry;
}

WKTConverter.prototype.wktToGeometryCollection = function(wkt) {
    var geometries = [];
    wkt = wkt.match(this.geometryCollectionRegExp)[1];
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        var closingBrackets = wkt.match(/^(POINT|LINESTRING|POLYGON)(\(\(?)/)[2].replace(/\(/g, ")");
        i = wkt.indexOf(closingBrackets) + closingBrackets.length;
        geometries.push(this.wktToGeometry(wkt.substring(0, i)));
    }
    return new GeometryCollection(geometries);
}

WKTConverter.prototype.wktToMultiGeometry = function(wkt) {
    var geometries = [];
    var match = wkt.match(this.multiGeometryRegExp);
    var geometryType = match[1];
    wkt = match[2];
    var closingBrackets = wkt.match(/^\(\(?/)[0].replace(/\(/g, ")");
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        i = wkt.indexOf(closingBrackets) + closingBrackets.length;
        geometries.push(this.wktToGeometry(geometryType + wkt.substring(0, i)));
    }
    return new GeometryCollection(geometries);
}

WKTConverter.prototype.wktToPoint = function(wkt) {
    wkt = wkt.match(this.pointRegExp)[1];
    var coordStrings = wkt.split(" ");
    return new Point(parseFloat(coordStrings[0]), parseFloat(coordStrings[1]));
}

WKTConverter.prototype.wktToLineString = function(wkt) {
    var points = [];
    wkt = wkt.match(this.lineStringRegExp)[1];
    var pointStrings = wkt.split(/,\s?/);
    for (var i = 0; i < pointStrings.length; ++i) {
        var coordStrings = pointStrings[i].split(" ");
        points.push(new Point(parseFloat(coordStrings[0]), parseFloat(coordStrings[1])));
    }
    return new LineString(points);
}

WKTConverter.prototype.wktToPolygon = function(wkt) {
    var lineStrings = [];
    wkt = wkt.match(this.polygonRegExp)[1];
    var closingBrackets = ")";
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        i = wkt.indexOf(closingBrackets) + 1;
        lineStrings.push(this.wktToLineString("LINESTRING" + wkt.substring(0, i)));
    }
    return new Polygon(lineStrings);
}

WKTConverter.prototype.geometryToWKT = function(geometry) {
    if (geometry instanceof GeometryCollection) {
        return this.geometryCollectionToWKT(geometry);
    } else if (geometry instanceof Point) {
        return this.pointToWKT(geometry);
    } else if (geometry instanceof LineString) {
        return this.lineStringToWKT(geometry);
    } else if (geometry instanceof Polygon) {
        return this.polygonToWKT(geometry);
    }
    return null;
}

WKTConverter.prototype.geometryCollectionToWKT = function(geometryCollection) {
    var wkt = "GEOMETRYCOLLECTION(";
    for (var i = 0; i < geometryCollection.childGeometries.length; ++i) {
        wkt += this.geometryToWKT(geometryCollection.childGeometries[i]);
        if (i < geometryCollection.childGeometries.length - 1) {
            wkt += ",";
        }
    }
    return wkt + ")";
}

WKTConverter.prototype.pointToWKT = function(point) {
    return "POINT(" + point.x + " " + point.y + ")";
}

WKTConverter.prototype.lineStringToWKT = function(lineString) {
    return "LINESTRING" + this.childCoordsToWKT(lineString);
}

WKTConverter.prototype.polygonToWKT = function(polygon) {
    return "POLYGON" + this.childCoordsToWKT(polygon);
}

WKTConverter.prototype.childCoordsToWKT = function(geometry) {
    var wkt = "(";
    for (var i = 0; i < geometry.childGeometries.length; ++i) {
        var child = geometry.childGeometries[i];
        if (child instanceof Point) {
            wkt += child.x + " " + child.y;
        } else if (child.childGeometries.length > 0) {
            wkt += this.childCoordsToWKT(child);
        }
        if (i < geometry.childGeometries.length - 1) {
            wkt += ",";
        }
    }
    return wkt + ")";
}

WKTConverter.prototype.wktToCoordPath = function(wkt) {
    return wkt.replace(/[^\d]+$/, "").replace(/^[^\d]+([\d.\s]+),\s*/g, "M $1 L ").replace(/\)+,\s*\(+([\d.\s]+),\s*/g, " M $1 L ");
}

