function Point(x, y){ 
	this.x = x;
    this.y = y;
}

Point.prototype = Object.create(Geometry.prototype);