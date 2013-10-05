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

LineString.prototype.addChild = function(child) {
	if (this.isChild(child)) {
		return;
	}
	if (!(child instanceof Point)) {
		return;
	}
	this.points.push(child);
	//console.log('-----LineString.prototype.addChild-----');
	child.setParent(this);
	//console.log('LineString.js:addChild '+this.points.length);
}
		
/*LineString.prototype.removeChild = function(child) {
	if ((!this.isChild(child))) {
		return;
	}
	if (points.length == 2) {
		var otherPoint = null;
		var pointIndex = -1;
		if (child == this.points[0]) {
			otherPoint = (Point)this.points[1];
			pointIndex = 0;
		} else if (child == points[1]) {
			otherPoint = (Point)this.points[0];
			pointIndex = 1;
		}
		points[pointIndex] = otherPoint.clone();
		points[pointIndex].parent = this;
	} else {
		for (var i = 0; i < points.length; i++) {
			if (points[i] == child) {
				points.splice(i, 1);
				break;
			}
		}
	}
	child.setParent(null);
}*/
		
LineString.prototype.getChildGeometries = function() {
	//console.log('LineString.prototype.getChildGeometries');
	return this.getPoints();
}
		
LineString.prototype.getPoints = function() {
	var copy = new Array();
    return copy.concat(this.points); 
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
	
