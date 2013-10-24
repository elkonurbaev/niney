function LineString(points) {
    this.points = null;
    if((points == null) || (points.length < 2)){
    	return;
    }
    this.points = points;
    var _points = this.getPoints();
    for(var i = 0; i < _points.length; ++i) {
    	points[i].setParent(this);
    }
}

LineString.prototype = new Geometry();
LineString.prototype.constructor = LineString;

LineString.prototype.addChild = function(child) {
	if (this.isChild(child)) {
		return;
	}
	if (!(child instanceof Point)) {
		return;
	}
	this.points.push(child);
	child.setParent(this);
}
		
LineString.prototype.removeChild = function(child) {
	if ((!this.isChild(child))) {
		return;
	}
	var _points = this.getPoints();
	if (_points.length == 2) {
		var otherPoint = null;
		var pointIndex = -1;
		if (child == this.points[0]) {
			otherPoint = this.points[1];
			pointIndex = 0;
		} else if (child == _points[1]) {
			otherPoint = this.points[0];
			pointIndex = 1;
		}
		_points[pointIndex] = otherPoint.clone();
		_points[pointIndex].parent = this;
	} 
	else {
		for (var i = 0; i < _points.length; i++) {
			if (_points[i] == child) {
				_points.splice(i, 1);
				break;
			}
		}
	}
	child.setParent(null);
}
		
LineString.prototype.getChildGeometries = function() {
	return this.getPoints();
}
		
LineString.prototype.getPoints = function() {
	var copy = new Array();
    return copy.concat(this.points); 
}

LineString.prototype.clone = function() {
	var clonedPoints = new Array();
	for(var i = 0; i < this.points.length; ++i) {
		clonedPoints.push(points[i].lcone());
	}
	return new LineString(clonedPoints);
}

LineString.prototype.getLength = function() {
	var length = 0;
	var previousPoint = null;
	for(var i = 0; i < this.points.length; ++i) {
		if (this.points[i] != this.points[0]) {
			length += this.points[i].getDistance(previousPoint);
		}
		previousPoint = this.points[i];
	}
	return length;
}
	
