function Geometry(){ 
	this.parent = null;
	this.envelope = null;
	this.childGeometries = new Array();
}

Geometry.prototype.setParent = function(parent){
	//console.log("setParent: " + this.parent + ' ' + parent.constructor);
	if(this.parent == parent) {
		//console.log("return: " + this.parent.constructor + ' ' + parent.constructor);
		return;
	}
	if(this.parent != null) {
		var previousParent = this.parent;
		this.parent = null;
		previousParent.removeChild(this);
	}
	if(parent != null) {
		this.parent = parent;
		parent.addChild(this);
	}
	this.parent = parent;
}	

Geometry.prototype.getParent = function(){
	//console.log("getParent");
	return this.parent;
}

Geometry.prototype.addChild = function(child){}

Geometry.prototype.removeChild = function(child){}

Geometry.prototype.getChildGeometries = function(){
	//console.log('Geometry.prototype.getChildGeometries');
	return null;
}

Geometry.prototype.isChild = function(child){
	var _childGeometries = this.getChildGeometries();
	//console.log('Geometry.prototype.isChild='+_childGeometries);
	for(var i = 0; i < _childGeometries.length; ++i){
		if(_childGeometries[i] == child){
			//console.log('Geometry.prototype.isChild='+child.constructor+ ' '+_childGeometries[i].constructor);
			return true;
		}
	}
	return false;
}

Geometry.prototype.getPoints = function(){
	var points = new Array();
	var _childGeometries = this.getChildGeometries();
	for(var i = 0; i < _childGeometries.length; ++i){
		points = points.concat(_childGeometries[i].getPoints());
	}
	return points;
}

Geometry.prototype.getEndPoint = function(){
	return this.points[this.points.length - 1];
}

Geometry.prototype.getCenterPoint = function(){
	var sumX = 0;
	var sumY = 0;
	for(var i = 0; i < this.points.length; ++i){
		sumX += this.points[i].x;
		sumY += this.points[i].y;
	}
	var numPoints = this.points.length;
	return new Point(sumX / numPoints, sumY / numPoints);
}

Geometry.prototype.getEnvelope = function(){
	if(this.envelope == null){
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxX = -Number.MAX_VALUE;
		var maxY = -Number.MAX_VALUE;
		for(var i = 0; i < this.points.length; ++i){
			if(minX > points[i].x){
				minX = points[i].x;
			}
			if(minY > points[i].y){
				minY = points[i].y;
			}
			if(maxX < points[i].x){
				maxX = points[i].x;
			}
			if(maxY < points[i].y){
				maxY = points[i].y;
			}
		}
		this.envelope = new Envelope(minX, minY, maxX, maxY);
	}
	return this.envelope;
}

Geometry.prototype.intersects = function(intersectingEnvelope){
	return this.envelope.intersects(intersectingEnvelope);
}

Geometry.prototype.equals = function(geometry){
	return false;
}

Geometry.prototype.clone = function(){
	return null;
}
