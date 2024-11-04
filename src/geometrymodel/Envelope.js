export function Envelope(minX, minY, maxX, maxY) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    
    var point0 = new Point(minX, minY);
    var point1 = new Point(maxX, maxY);
    point0.setParent(this);
    point1.setParent(this);
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.getEnvelope = function() {
    if (this.envelope == null) {
        this.envelope = this.clone();
    }
    return this.envelope;
}

Envelope.prototype.round = function(numDecimals) {
    var pow = Math.pow(10, numDecimals);
    this.minX = Math.round(this.minX * pow) / pow;
    this.minY = Math.round(this.minY * pow) / pow;
    this.maxX = Math.round(this.maxX * pow) / pow;
    this.maxY = Math.round(this.maxY * pow) / pow;
    
    Geometry.prototype.round.call(this, numDecimals);
}

Envelope.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return geometry.intersects(this);
    }
    
    if (geometry instanceof Envelope) {
        return (
            (this.minX <= geometry.maxX) &&
            (this.minY <= geometry.maxY) &&
            (this.maxX >= geometry.minX) &&
            (this.maxY >= geometry.minY)
        );
    }
    
    return this.intersects(geometry.getEnvelope());
}

Envelope.prototype.equals = function(geometry) {
    if (!(geometry instanceof Envelope)) {
        return false;
    }
    
    return (
        (this.minX == geometry.minX) &&
        (this.minY == geometry.minY) &&
        (this.maxX == geometry.maxX) &&
        (this.maxY == geometry.maxY)
    );
}

Envelope.prototype.clone = function() {
    return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}

Envelope.prototype.invalidateEnvelope = function() {
    Geometry.prototype.invalidateEnvelope.call(this);
    
    if (this.childGeometries[0].x <= this.childGeometries[1].x) {
        this.minX = this.childGeometries[0].x;
        this.maxX = this.childGeometries[1].x;
    } else {
        this.minX = this.childGeometries[1].x;
        this.maxX = this.childGeometries[0].x;
    }
    if (this.childGeometries[0].y <= this.childGeometries[1].y) {
        this.minY = this.childGeometries[0].y;
        this.maxY = this.childGeometries[1].y;
    } else {
        this.minY = this.childGeometries[1].y;
        this.maxY = this.childGeometries[0].y;
    }
}

Envelope.prototype.getWidth = function() {
    return this.maxX - this.minX;
}

Envelope.prototype.getHeight = function() {
    return this.maxY - this.minY;
}

Envelope.prototype.grow = function(factor) {
    var displacementFactor = (factor - 1) / 2;
    var dx = this.getWidth() * displacementFactor;
    var dy = this.getHeight() * displacementFactor;
    var minX = this.minX - dx;
    var minY = this.minY - dy;
    var maxX = this.maxX + dx;
    var maxY = this.maxY + dy;
    
    this.childGeometries[0].setXY(minX, minY);
    this.childGeometries[1].setXY(maxX, maxY);
    
    this.invalidateEnvelope();
    
    return this;
}

Envelope.prototype.intersection = function(envelope) {
    if (!(envelope instanceof Envelope)) {
        return;
    }
    
    return new Envelope(
        Math.max(this.minX, envelope.minX),
        Math.max(this.minY, envelope.minY),
        Math.min(this.maxX, envelope.maxX),
        Math.min(this.maxY, envelope.maxY)
    );
}

Envelope.prototype.toString = function() {
    return "Envelope(" + this.minX + ", " + this.minY + ", " + this.maxX + ", " + this.maxY + ")";
}

