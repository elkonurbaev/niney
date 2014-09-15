function Polygon(points){
    this.points = points;
}

Polygon.prototype = new Geometry();
Polygon.prototype.constructor = Polygon;