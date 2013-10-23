function Envelope(minX, minY, maxX, maxY) {
	this.point0 = new Point(minX, minY);
	this.point0.setParent(this);
	this.point1 = new Point(maxX, maxY);
	this.point1.setParent(this);
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.childGeometries = function() {
	return new Array(this.point0, this.point1);
}
		
Envelope.prototype.getPoints = function() {
	return new Array(this.point0, this.point1);
}
		
Envelope.prototype.getEndPoint = function() {
	return this.point1;
}
		
Envelope.prototype.getCenterPoint = function() {
	var centerX = (this.minX + this.maxX) / 2;
	var centerY = (this.minY + this.maxY) / 2;
	return new Point(centerX, centerY);
}
		
Envelope.prototype.getEnvelope = function() {
	return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}
		
Envelope.prototype.intersects = function(intersectingEnvelope) {
	if (
		(this.minX > intersectingEnvelope.maxX) ||
		(this.maxX < intersectingEnvelope.minX) ||
		(this.minY > intersectingEnvelope.maxY) ||
		(this.maxY < intersectingEnvelope.minY)
	) {
		return false;
	}
	return true;
}		

Envelope.prototype.equals = function(geometry) {
	if(!(geometry instanceof Envelope)) {
		return false;
	}
	if(
		(minX == Envelope(geometry).minX) &&
		(minY == Envelope(geometry).minY) &&
		(maxX == Envelope(geometry).maxX) &&
		(maxY == Envelope(geometry).maxY)
	){
		return true;
	}
	return false;
}

Envelope.prototype.clone = function() {
	return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}
		
Envelope.prototype.getMinX = function(){
	if (this.point0.getX() <= this.point1.getX()) {
		return this.point0.getX();
	} else {
		return this.point1.getX();
	}
}
		
Envelope.prototype.getMinY = function() {
if (this.point0.getY() <= this.point1.getY()) {
		return this.point0.getY();
	} else {
		return this.point1.getY();
	}
}

Envelope.prototype.getMaxX = function(){
	if (this.point0.getX() >= this.point1.getX()) {
		return this.point0.getX();
	} else {
		return this.point1.getX();
	}
}		

Envelope.prototype.getMaxY = function() {
if (this.point0.getY() >= this.point1.getY()) {
		return this.point0.getY();
	} else {
		return this.point1.getY();
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
	var dx = width * displacementFactor;
	var dy = height * displacementFactor;
			
	this.point0.move(-dx, -dy);
	this.point1.move(dx, dy);
}

Envelope.prototype.toString = function() {
    return "Envelope(" + this.getMinX() + ", " + this.getMinY() + ", " + this.getMaxX() + ", " + this.getMaxY() + ")";
}

