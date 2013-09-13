function Polygon(points){
    //this._super(this);
    this.points = points;
}

Polygon.prototype = Object.create(Geometry.prototype);