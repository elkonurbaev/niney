function GeometryCollection(geometries) {
	this.geometries = null;
	if((geometries == null) || (geometries.length == 0)) {
    	return;
    }
    this.geometries = geometries;
	for(var i = 0; i < this.geometries.length; ++i) {
		this.geometries[i].setParent(this);
	}
}

GeometryCollection.prototype = new Geometry();

GeometryCollection.prototype.addChild = function(child) {
	if (this.isChild(child)) {
		return;
	}
	this.geometries.push(child);
	child.parent = this;
}
		
GeometryCollection.prototype.removeChild = function(child) {
	if (!this.isChild(child)) {
		return;
	}
	for (var i = 0; i < points.length; i++) {
		if (points[i] == child) {
			points.splice(i, 1);
			break;
		}
	}
	child.parent = null;
}
		
GeometryCollection.prototype.getChildGeometries = function() {
	return this.geometries;
}

GeometryCollection.prototype.clone = function() {
	var clonedGeometries = new Array();
	for(var i = 0; i < this.geometries.length; ++i) {
		clonedGeometries.push(geometries[i].clone());
	}
	return new GeometryCollection(clonedGeometries);
}
