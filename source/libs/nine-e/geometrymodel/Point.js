function Point(x, y){ 
	this.x = x;
    this.y = y;
    this.getParent();
}

Point.prototype = new Geometry();