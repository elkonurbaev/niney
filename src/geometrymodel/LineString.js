export function LineString(points) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    if ((points == null) || (points.length < 2)) {
        return;
    }
    
    for (var i = 0; i < points.length; ++i) {
        points[i].setParent(this);
    }
}

LineString.prototype = new Geometry();
LineString.prototype.constructor = LineString;

LineString.prototype.addChild = function(child) {
    if (this.isChild(child)) {
        return;
    }
    if (!(child instanceof Point)) {
        return;
    }
    
    this.childGeometries.push(child);
    child.setParent(this);
}

LineString.prototype.removeChild = function(child) {
    if (!this.isChild(child)) {
        return;
    }
    
    if (this.childGeometries.length == 2) {
        if (child == this.childGeometries[0]) {
            this.childGeometries[0] = this.childGeometries[1].clone();
            this.childGeometries[0].$parent = this;
        } else {  // (child == this.childGeometries[1])
            this.childGeometries[1] = this.childGeometries[0].clone();
            this.childGeometries[1].$parent = this;
        }
    } else {
        for (var i = 0; i < this.childGeometries.length; i++) {
            if (this.childGeometries[i] == child) {
                this.childGeometries.splice(i, 1);
                break;
            }
        }
    }
    child.$parent = null;
}

LineString.prototype.getLineStrings = function() {
    return [this];
}

LineString.prototype.clone = function() {
    var clonedPoints = [];
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedPoints.push(this.childGeometries[i].clone());
    }
    return new LineString(clonedPoints);
}

LineString.prototype.getLength = function() {
    var length = 0;
    for (var i = 1; i < this.childGeometries.length; ++i) {
        length += this.childGeometries[i].getDistance(this.childGeometries[i - 1]);
    }
    return length;
}

LineString.prototype.getArea = function() {
    var area = 0;
    for (var i = 0; i < this.childGeometries.length; ++i) {
        var j = (i + 1) % this.childGeometries.length;
        area += this.childGeometries[i].x * this.childGeometries[j].y;
        area -= this.childGeometries[i].y * this.childGeometries[j].x;
    }
    return Math.abs(area / 2);
}

