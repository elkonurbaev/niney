function Polygon(points){
    //this._super(this);
    this.points = points;
}

Polygon.prototype = new Geometry();
Polygon.prototype.constructor = Polygon;