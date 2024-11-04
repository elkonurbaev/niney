export function JsonConverter() { }

JsonConverter.prototype.geometryToJson = function(geometry, stringify) {
    var getType = function(geometry) {
        if (geometry instanceof GeometryCollection) {
            return "GeometryCollection";
        }
        if (geometry instanceof Point) {
            return "Point";
        }
        if (geometry instanceof LineString) {
            return "LineString";
        }
        if (geometry instanceof Polygon) {
            return "Polygon";
        }
        if (geometry instanceof Envelope) {
            return "Envelope";
        }
        return "Geometry";
    };
    var getCoordinates = function(geometry) {
        if (geometry instanceof Point) {
            return [geometry.x, geometry.y];
        }
        var coordinates = [];      
        for (var i = 0; i < geometry.childGeometries.length; i++) {
            coordinates.push(getCoordinates(geometry.childGeometries[i]));
        }
        return coordinates;
    };
    var json = {
        type: getType(geometry),
        coordinates: getCoordinates(geometry)
    };
    
    if (stringify) {
        return JSON.stringify(json);
    }
    return json;
}

