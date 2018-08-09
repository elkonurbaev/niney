function MapFeatureModel() {
    this.bounds = null;
    this.centerScale = null;
    this.envelope = null;
    this.features = null;
    this.geometries = null;
    this.geometry = null;
    
    this.maxScale = Number.MAX_VALUE;
    this.envelopeCheck = false;
    this.propertyIndex = 0;
    this.deepWatch = false;
    this.inverseFill = false;
    
    this.ctx = null;
    this.css = null;
    
    this.mapFeatures = [];
    this.nonPointGeometries = [];
    this.points = [];
}

MapFeatureModel.prototype.setBounds = function(bounds) {
    this.bounds = bounds;
    // Don't set map features now, because a bounds change is immediately followed by an envelope change.
}

MapFeatureModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    // Don't set map features now, because a centerscale change is immediately followed by an envelope change.
}

MapFeatureModel.prototype.setEnvelope = function(envelope) {
    this.envelope = envelope;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setFeatures = function(features) {
    this.features = features;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setGeometries = function(geometries) {
    this.geometries = geometries;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setGeometry = function(geometry) {
    this.geometry = geometry;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setMapFeatures = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if ((this.envelope == null) && (this.envelopeCheck || this.inverseFill)) {
        return;
    }
    
    if (this.ctx != null) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);  // ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    } else {
        this.mapFeatures = [];
        this.nonPointGeometries = [];
        this.points = [];
    }
    
    if ((this.features == null) && (this.geometries == null) && (this.geometry == null)) {
        return;
    }
    if (this.maxScale < this.centerScale.scale) {
        return;
    }
    
    if (this.ctx != null) {
        var scaling = this.centerScale.getNumPixs(1);
        var dx = -this.centerScale.centerX * scaling + this.bounds.width / 2;
        var dy = this.centerScale.centerY * scaling + this.bounds.height / 2;
        this.ctx.setTransform(scaling, 0, 0, -scaling, dx, dy);
        
        this.ctx.fillStyle = this.css.getPropertyValue("fill");
        this.ctx.strokeStyle = this.css.getPropertyValue("stroke");
        this.ctx.lineWidth = parseInt(this.css.getPropertyValue("stroke-width")) / scaling;
    }
    
    if (this.features != null) {
        for (var i = 0; i < this.features.length; i++) {
            var geometry = this.features[i].propertyValues[this.propertyIndex];
            if (geometry instanceof Geometry) {
                this.assignGeometry(geometry, this.features[i]);
            } else {  // geometry is a path string that renders on a (transformed) canvas.
                this.draw(geometry);
            }
        }
    } else if (this.geometries != null) {
        for (var i = 0; i < this.geometries.length; i++) {
            this.assignGeometry(this.geometries[i]);
        }
    } else {  // this.geometry != null
        this.assignGeometry(this.geometry);
    }
}

MapFeatureModel.prototype.assignGeometry = function(geometry) {
    if (this.envelopeCheck && !geometry.intersects(this.envelope)) {
        return;
    }
    
    if (geometry instanceof Point) {
        if (this.ctx != null) {
            var scaling = this.centerScale.getNumPixs(1);
            var circleRadius = parseInt(this.css.getPropertyValue("--circle-radius")) / scaling;
            this.ctx.beginPath();
            this.ctx.arc(geometry.x, geometry.y, circleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.points.push(geometry);
        }
    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
        if (this.ctx != null) {
            var path = (new SVGConverter()).geometryToCoordPath(geometry);
            this.draw(path);
        } else {
            this.nonPointGeometries.push(geometry);
        }
    } else {  // Multi-geometry or geometry collection.
        for (var i = 0; i < geometry.childGeometries.length; i++) {
            this.assignGeometry(geometry.childGeometries[i]);
        }
    }
}

MapFeatureModel.prototype.draw = function(path) {
    if (this.inverseFill) {
        var minx = this.envelope.getMinX();
        var miny = this.envelope.getMinY();
        var maxx = this.envelope.getMaxX();
        var maxy = this.envelope.getMaxY();
        var path = "M " + minx + " " + miny + " " + " L " + maxx + " " + miny + " " + maxx + " " + maxy + " " + minx + " " + maxy + " Z " + path;
    }
    if (typeof Path2D === "function") {
        var p = new Path2D(path);
        this.ctx.fill(p, "evenodd");
        this.ctx.filter = this.css.getPropertyValue("--stroke-filter");
        this.ctx.stroke(p);
        this.ctx.filter = "none";
    } else {  // Polyfill for IE11.
        this.ctx.beginPath();
        path = path.replace(/,/g, " ");
        var pathItems = path.split(" ");
        for (var i = 0; i < pathItems.length; i++) {
            if ((pathItems[i] == "") || (pathItems[i] == "Z") || (pathItems[i] == "L")) {
                continue;
            }
            if (pathItems[i] == "M") {
                this.ctx.moveTo(pathItems[++i], pathItems[++i]);
            } else {
                this.ctx.lineTo(pathItems[i], pathItems[++i]);
            }
        }
        this.ctx.fill("evenodd");
        this.ctx.filter = this.css.getPropertyValue("--stroke-filter");
        this.ctx.stroke();
        this.ctx.filter = "none";
    }
}

