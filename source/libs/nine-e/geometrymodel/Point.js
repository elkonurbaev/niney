function Point(x, y){ 
	this.x = x;
    this.y = y;
    //this.getParent();
}

Point.prototype = new Geometry();

Point.prototype.getChildGeometries = function(){
	return new Array();
}

Point.prototype.getPoints = function(){
	return new Array(this);
}

Point.prototype.getEndPoint = function(){
	return this;
}

Point.prototype.getCenterPoint = function(){
	return new Point(this.x, this.y);
}

Point.prototype.getEnvelope = function(){
	return new Envelope(this.x, this.y, this.x, this.y);
}

Point.prototype.intersects = function(intersectingEnvelope){
	if (
			(this.x >= intersectingEnvelope.minX) &&
			(this.x <= intersectingEnvelope.maxX) &&
			(this.y >= intersectingEnvelope.minY) &&
			(this.y <= intersectingEnvelope.maxY)
	) {
			return true;
	}
	return false;
}	

Point.prototype.move = function(dx, dy){
	this.x += dx;
	this.y += dy;
}

Point.prototype.equals = function(geometry) {
	if (!(geometry instanceof Point)) {
		return false;
	}
	if ((this.x == Point(geometry).x) && (this.y == Point(geometry).y)) {
		return true;
	}
	return false;
}
		
Point.prototype.clone = function() {
	return new Point(this.x, this.y);
}

Point.prototype.getX = function(){
	return this.x;
}

Point.prototype.getY = function(){
	return this.y;
}

Point.prototype.getDistance = function(point) {
	var dx = this.x - point.getX();
	var dy = this.y - point.getY();
	var distance = Math.sqrt((dx * dx) + (dy * dy));
	return distance;
}