function Envelope(minX, minY, maxX, maxY) {
    this.$parent = null;
    this.childGeometries = new Array();
    this.envelope = null;
    
    var point0 = new Point(minX, minY);
    var point1 = new Point(maxX, maxY);
    point0.setParent(this);
    point1.setParent(this);
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.getEnvelope = function() {
    return this.clone();
}

Envelope.prototype.intersects = function(intersectingEnvelope) {
    return (
        (this.getMinX() <= intersectingEnvelope.getMaxX()) &&
        (this.getMinY() <= intersectingEnvelope.getMaxY()) &&
        (this.getMaxX() >= intersectingEnvelope.getMinX()) &&
        (this.getMaxY() >= intersectingEnvelope.getMinY())
    );
}

Envelope.prototype.equals = function(geometry) {
    if (!(geometry instanceof Envelope)) {
        return false;
    }
    return (
        (
         this.childGeometries[0].equals(geometry.childGeometries[0]) &&
         this.childGeometries[1].equals(geometry.childGeometries[1])
        ) || (
         this.childGeometries[1].equals(geometry.childGeometries[0]) &&
         this.childGeometries[0].equals(geometry.childGeometries[1])
        )
    );
}

Envelope.prototype.clone = function() {
    return new Envelope(this.getMinX(), this.getMinY(), this.getMaxX(), this.getMaxY());
}

Envelope.prototype.getMinX = function() {
    return Math.min(this.childGeometries[0].x, this.childGeometries[1].x);
}

Envelope.prototype.getMinY = function() {
    return Math.min(this.childGeometries[0].y, this.childGeometries[1].y);
}

Envelope.prototype.getMaxX = function() {
    return Math.max(this.childGeometries[0].x, this.childGeometries[1].x);
}

Envelope.prototype.getMaxY = function() {
    return Math.max(this.childGeometries[0].y, this.childGeometries[1].y);
}

Envelope.prototype.getWidth = function() {
    return this.getMaxX() - this.getMinX();
}

Envelope.prototype.getHeight = function() {
    return this.getMaxY() - this.getMinY();
}

Envelope.prototype.grow = function(factor) {
    var displacementFactor = (factor - 1) / 2;
    var dx = width * displacementFactor;
    var dy = height * displacementFactor;
    var minX = this.getMinX() - dx;
    var minY = this.getMinY() - dy;
    var maxX = this.getMaxX() + dx;
    var maxY = this.getMaxY() + dy;
    this.childGeometries[0].setXY(minX, minY);
    this.childGeometries[1].setXY(maxX, maxY);
}

Envelope.prototype.toString = function() {
    return "Envelope(" + this.getMinX() + ", " + this.getMinY() + ", " + this.getMaxX() + ", " + this.getMaxY() + ")";
}

