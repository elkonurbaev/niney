function LineString(points){
    this.points = null;
    if((points == null) || (points.length < 2)){
    	return;
    }
    this.points = points;
    for(var i = 0; i < this.points.length; ++i){
    	points[i].setParent(this);
    }
}

LineString.prototype = new Geometry();

LineString.prototype.getChildGeometries = function() {
	return this.points;
}
		
LineString.prototype.getPoints = function() {
    return this.points; 
}

LineString.prototype.clone = function(){
	var clonedPoints = new Array();
	for(var i = 0; i < this.points.length; ++i){
		clonedPoints.push(points[i].lcone());
	}
	return new LineString(clonedPoints);
}

LineString.prototype.getLength = function() {
	var length = 0;
	var previousPoint = null;
	for(var i = 0; i < this.points.length; ++i){
		if (this.points[i] != this.points[0]) {
			length += this.points[i].getDistance(previousPoint);
		}
		previousPoint = this.points[i];
	}
	return length;
}
	