export function Point(x, y) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
Point.prototype.constructor = Point;

Point.prototype.addChild = function(child) { }

Point.prototype.removeChild = function(child) { }

Point.prototype.getPoints = function() {
    return [this];
}

Point.prototype.getEndPoint = function() {
    return this;
}

Point.prototype.getCenterPoint = function() {
    return this.clone();
}

Point.prototype.getEnvelope = function() {
    if (this.envelope == null) {
        this.envelope = new Envelope(this.x, this.y, this.x, this.y);
    }
    return this.envelope;
}

Point.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return this.equals(geometry);
    }
    
    if (geometry instanceof Polygon) {
        var numWindings = 0;
        var points = geometry.getPoints();
        for (var i = 0; i < points.length - 1; i++) {
            if (points[i].y <= this.y) {
                if ((points[i + 1].y > this.y) && (this.isLeft(points[i], points[i + 1]) > 0)) {
                    numWindings++;
                }
            } else {
                if ((points[i + 1].y <= this.y) && (this.isLeft(points[i], points[i + 1]) < 0)) {
                    numWindings--;
                }
            }
        }
        return numWindings != 0;
    }
    
    if (geometry instanceof Envelope) {
        return (
            (this.x >= geometry.minX) &&
            (this.y >= geometry.minY) &&
            (this.x <= geometry.maxX) &&
            (this.y <= geometry.maxY)
        );
    }
    
    return this.intersects(geometry.getEnvelope());
}

Point.prototype.isLeft = function(point0, point1) {
    return (point1.x - point0.x) * (this.y - point0.y) - (this.x -  point0.x) * (point1.y - point0.y);
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
    
    this.invalidateEnvelope();
}

Point.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    
    this.invalidateEnvelope();
}

