function Polygon(lineStrings) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    if ((lineStrings == null) || (lineStrings.length < 1)) {
        return;
    }
    
    for (var i = 0; i < lineStrings.length; i++) {
        lineStrings[i].setParent(this);
    }
}

Polygon.prototype = new Geometry();
Polygon.prototype.constructor = Polygon;

Polygon.prototype.getPoints = function() {
    return this.childGeometries[0].getPoints();
}

Polygon.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return geometry.intersects(this);
    }
    
    return this.getEnvelope().intersects(geometry);
}

Polygon.prototype.clone = function() {
    var clonedLineStrings = [];
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedLineStrings.push(this.childGeometries[i].clone());
    }
    return new Polygon(clonedLineStrings);
}

