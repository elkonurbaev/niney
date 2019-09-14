export function GeometryCollection(geometries) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    if ((geometries == null) || (geometries.length == 0)) {
        return;
    }
    
    for (var i = 0; i < geometries.length; ++i) {
        geometries[i].setParent(this);
    }
}

GeometryCollection.prototype = new Geometry();
GeometryCollection.prototype.constructor = GeometryCollection;

GeometryCollection.prototype.clone = function() {
    var clonedGeometries = [];
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedGeometries.push(this.childGeometries[i].clone());
    }
    return new GeometryCollection(clonedGeometries);
}
