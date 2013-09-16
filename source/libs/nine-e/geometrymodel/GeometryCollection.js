function GeometryCollection(geometries){
   // this._super();
    this.geometries = geometries;
}

GeometryCollection.prototype = new Geometry();