function LineString(points){
    this.points = points;
}

LineString.prototype = Object.create(Geometry.prototype);