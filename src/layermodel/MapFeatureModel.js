function MapFeatureModel() {
    this.bounds = null;
    this.centerScale = null;
    this.envelope = null;
    this.features = null;
    this.geometries = null;
    this.geometry = null;
    
    this.animating = false;
    
    this.animate = true;
    this.filter = null;
    this.maxScale = Number.MAX_VALUE;
    this.envelopeCheck = false;
    this.propertyIndex = -1;
    this.idPropertyName = "id";
    this.geometryPropertyName = "geometry";
    this.inverseFill = false;
    
    this.ctx = null;
    this.css = null;
    
    this.filterFeatures = [];
    this.mapFeatures = [];
    this.nonPointGeometries = [];
    this.points = [];
}

MapFeatureModel.prototype.setFilter = function(filterExpression) {
    this.filter = null;
    if (filterExpression != null) {
        var match = filterExpression.match(/(\[(\d+)\]|[\w\.]*)\s*==\s*(.*)/);
        if (match[2] != null) {
            this.filter = new Filter(parseInt(match[2]), match[3]);  // propertyIndex
        } else {
            this.filter = new Filter(match[1], match[3]);  // propertyName
        }
    }
}

MapFeatureModel.prototype.setBounds = function(bounds) {
    this.bounds = bounds;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.setMapFeatures();
}

MapFeatureModel.prototype.setFeatures = function(features) {
    this.features = features;
    this.filterFeatures = [];
    
    if (features == null) {
        return;
    }
    
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if (feature.propertyValues != null) {
            var id = i;
            var geometry = feature.propertyValues[
                (feature.propertyValues.length + this.propertyIndex) % feature.propertyValues.length
            ];
            if ((geometry != null) && (
                (this.filter == null) ||
                (feature.propertyValues[this.filter.propertyIndex] == this.filter.value)
            )) {
                this.filterFeatures.push({id: id, geometry: geometry, feature: feature});
            }
        } else {
            var geometries = getFeatureValues(feature, this.geometryPropertyName);
            if (geometries[0] == null) {
                continue;
            }
            var ids = getFeatureValues(feature, this.idPropertyName);
            if ((ids[0] == null) || (ids.length != geometries.length)) {
                ids = null;
            }
            var filterValues = null;
            if ((this.filter != null) && (this.filter.propertyName != "")) {
                filterValues = getFeatureValues(feature, this.filter.propertyName);
                if (filterValues.length != geometries.length) {
                    continue;
                }
            }
            
            for (var j = 0; j < geometries.length; j++) {
                if ((this.filter != null) && (
                    ((this.filter.propertyName == "") && (this.filter.value != i)) ||
                    ((this.filter.propertyName != "") && (this.filter.value != filterValues[j]))
                )) {
                    continue;
                }
                
                this.filterFeatures.push({
                    id: (ids != null)? ids[j]: (i + "-" + j),
                    geometry: geometries[j],
                    feature: feature
                });
            }
        }
    }
    
    function getFeatureValues(feature, propertyName) {
        var propertyNameParts = propertyName.split(".");
        var featureBranches = [feature];
        while ((propertyNameParts.length > 0) && (featureBranches[0] != null)) {
            var propertyNamePart = propertyNameParts.shift();
            var nextBranches = [];
            for (var i = 0; i < featureBranches.length; i++) {
                var nextBranch = featureBranches[i][propertyNamePart];
                if (!Array.isArray(nextBranch)) {
                    nextBranches.push(nextBranch);
                } else {
                    for (var j = 0; j < nextBranch.length; j++) {
                        nextBranches.push(nextBranch[j]);
                    }
                }
            }
            featureBranches = nextBranches;
        }
        return featureBranches;
    }
    
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

MapFeatureModel.prototype.setAnimating = function(animating) {
    this.animating = animating;
    if (!this.animate) {
        this.setMapFeatures();
    }
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
    if (!this.animate && this.animating) {
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
        
        var strokeFilter = this.css.getPropertyValue("--stroke-filter") || "none";
        var graphicSize = (parseInt(this.css.getPropertyValue("--circle-radius") || 8) + 1) / 2 / scaling;
    }
    
    if (this.features != null) {
        for (var i = 0; i < this.filterFeatures.length; i++) {
            var geometry = this.filterFeatures[i].geometry;
            if (geometry instanceof Geometry) {
                this.assignGeometry(this.filterFeatures[i], geometry, strokeFilter, graphicSize);
            } else {  // geometry is a path string that renders on a (transformed) canvas.
                this.drawPath(geometry, strokeFilter);
            }
        }
    } else if (this.geometries != null) {
        for (var i = 0; i < this.geometries.length; i++) {
            this.assignGeometry(null, this.geometries[i], strokeFilter, graphicSize);
        }
    } else {  // this.geometry != null
        this.assignGeometry(null, this.geometry, strokeFilter, graphicSize);
    }
}

MapFeatureModel.prototype.assignGeometry = function(mapFeature, geometry, strokeFilter, graphicSize) {
    if (this.envelopeCheck && !geometry.intersects(this.envelope)) {
        return;
    }
    
    if (mapFeature != null) {
        this.mapFeatures.push(mapFeature);
    }
    
    if (geometry instanceof Point) {
        if (this.ctx != null) {
            this.ctx.beginPath();
            this.ctx.arc(geometry.x, geometry.y, graphicSize, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.filter = strokeFilter;
            this.ctx.stroke();
            this.ctx.filter = "none";
        } else {
            this.points.push(geometry);
        }
    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
        if (this.ctx != null) {
            var path = (new SVGConverter()).geometryToCoordPath(geometry);
            this.drawPath(path, strokeFilter);
        } else {
            this.nonPointGeometries.push(geometry);
        }
    } else {  // Multi-geometry or geometry collection.
        for (var i = 0; i < geometry.childGeometries.length; i++) {
            this.assignGeometry(null, geometry.childGeometries[i], strokeFilter, graphicSize);
        }
    }
}

MapFeatureModel.prototype.drawPath = function(path, strokeFilter) {
    if (this.inverseFill) {
        var minX = this.envelope.minX;
        var minY = this.envelope.minY;
        var maxX = this.envelope.maxX;
        var maxY = this.envelope.maxY;
        var path = "M " + minX + " " + minY + " " + " L " + maxX + " " + minY + " " + maxX + " " + maxY + " " + minX + " " + maxY + " Z " + path;
    }
    if ((typeof Path2D === "function") && (navigator.userAgent.indexOf("Edge/") == -1)) {
        var p = new Path2D(path);
        this.ctx.fill(p, "evenodd");
        this.ctx.filter = strokeFilter;
        this.ctx.stroke(p);
        this.ctx.filter = "none";
    } else {  // Polyfill for IE11 and Edge.
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
        this.ctx.filter = strokeFilter;
        this.ctx.stroke();
        this.ctx.filter = "none";
    }
}

