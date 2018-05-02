function Point(x, y) {
    this.$parent = null;
    this.childGeometries = new Array();
    this.envelope = null;
    
    this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
Point.prototype.constructor = Point;

Point.prototype.addChild = function(child) { }

Point.prototype.removeChild = function(child) { }

Point.prototype.getPoints = function() {
    return new Array(this);
}

Point.prototype.getEndPoint = function() {
    return this;
}

Point.prototype.getCenterPoint = function() {
    return this.clone();
}

Point.prototype.getEnvelope = function() {
    return new Envelope(this.x, this.y, this.x, this.y);
}

Point.prototype.intersects = function(intersectingEnvelope) {
    return (
        (this.x >= intersectingEnvelope.getMinX()) &&
        (this.y >= intersectingEnvelope.getMinY()) &&
        (this.x <= intersectingEnvelope.getMaxX()) &&
        (this.y <= intersectingEnvelope.getMaxY())
    );
}

Point.prototype.equals = function(geometry) {
    if (!(geometry instanceof Point)) {
        return false;
    }
    if ((this.x == geometry.x) && (this.y == geometry.y)) {
        return true;
    }
    return false;
}

Point.prototype.clone = function() {
    return new Point(this.x, this.y);
}

Point.prototype.getDistance = function(point) {
    var dx = this.x - point.x;
    var dy = this.y - point.y;
    var distance = Math.sqrt((dx * dx) + (dy * dy));
    return distance;
}

Point.prototype.setXY = function(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
}

