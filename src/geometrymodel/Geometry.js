function Geometry() {
    this.$parent = null;  // Starts with $ to prevent recursion in angular.equals (geometry.childGeometries[0].$parent == geometry and so on).
    this.childGeometries = new Array();
    this.envelope = null;
}

Geometry.prototype.setParent = function(parent) {
    if (this.$parent == parent) {
        return;
    }
    if (this.$parent != null) {
        var previousParent = this.$parent;
        this.$parent = null;
        previousParent.removeChild(this);
    }
    if (parent != null) {
        this.$parent = parent;
        parent.addChild(this);
    }
}

Geometry.prototype.addChild = function(child) {
    if (this.isChild(child)) {
        return;
    }
    
    this.childGeometries.push(child);
    child.setParent(this);
}

Geometry.prototype.removeChild = function(child) {
    if (!this.isChild(child)) {
        return;
    }
    
    for (var i = 0; i < this.childGeometries.length; i++) {
        if (this.childGeometries[i] == child) {
            this.childGeometries.splice(i, 1);
            break;
        }
    }
    child.$parent = null;
}

Geometry.prototype.isChild = function(child) {
    for (var i = 0; i < this.childGeometries.length; ++i) {
        if (this.childGeometries[i] == child) {
            return true;
        }
    }
    return false;
}

Geometry.prototype.getPoints = function() {
    var points = new Array();
    for (var i = 0; i < this.childGeometries.length; ++i) {
        points = points.concat(this.childGeometries[i].getPoints());
    }
    return points;
}

Geometry.prototype.getEndPoint = function() {
    var points = this.getPoints();
    return points[points.length - 1];
}

Geometry.prototype.getCenterPoint = function() {
    var points = this.getPoints();
    var sumX = 0;
    var sumY = 0;
    for (var i = 0; i < points.length; ++i) {
        sumX += points[i].x;
        sumY += points[i].y;
    }
    return new Point(sumX / points.length, sumY / points.length);
}

Geometry.prototype.getLineStrings = function() {
    var lineStrings = [];
    for (var i = 0; i < this.childGeometries.length; i++) {
        lineStrings = lineStrings.concat(this.childGeometries[i].getLineStrings());
    }
    return lineStrings;
}

Geometry.prototype.getEnvelope = function() {
    if (this.envelope == null) {
        var points = this.getPoints();
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        for (var i = 0; i < points.length; ++i) {
            if (minX > points[i].x) {
                minX = points[i].x;
            }
            if (minY > points[i].y) {
                minY = points[i].y;
            }
            if (maxX < points[i].x) {
                maxX = points[i].x;
            }
            if (maxY < points[i].y) {
                maxY = points[i].y;
            }
        }
        this.envelope = new Envelope(minX, minY, maxX, maxY);
    }
    return this.envelope;
}

Geometry.prototype.intersects = function(intersectingEnvelope) {
    return this.getEnvelope().intersects(intersectingEnvelope);
}

Geometry.prototype.equals = function(geometry) {
    if (geometry == null) {
        return false;
    }
    if (this.childGeometries.length != geometry.childGeometries.length) {
        return false;
    }
    for (var i = 0; i < this.childGeometries.length; i++) {
        if (!this.childGeometries[i].equals(geometry.childGeometries[i])) {
            return false;
        }
    }
    return true;
}

Geometry.prototype.clone = function() {
    return null;
}

Geometry.prototype.invalidateEnvelope = function() {
    this.envelope = null;
    if (this.$parent != null) {
        this.$parent.invalidateEnvelope();
    }
}

