export function MapFeatureModel() {
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
    this.includePoints = false;
    this.cssFunction = null;
    
    this.ctx = null;
    this.css = null;
    
    this.glShaderCenter = null;
    this.glShaderScale = null;
    
    this.filterFeatures = [];
    this.vertices = [];
    this.mapFeatures = [];
    this.nonPointGeometries = [];
    this.points = [];
}

MapFeatureModel.prototype.setFilter = function(filterExpression) {
    this.filter = null;
    if (filterExpression != null) {
        var match = filterExpression.match(/(\[(\d+)\]|[\w\.]*)\s*([=<>]=)\s*(.*)/);
        if (match[2] != null) {
            this.filter = new Filter(parseInt(match[2]), match[4], match[3]);  // propertyIndex
        } else {
            this.filter = new Filter(match[1], match[4], match[3]);  // propertyName
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
        if (feature.propertyValues != null) {  // Feature from a feature model.
            var id = i;
            var geometry = feature.propertyValues[
                (feature.propertyValues.length + this.propertyIndex) % feature.propertyValues.length
            ];
            if ((geometry != null) && (
                (this.filter == null) || (this.filter.propertyIndex == null) ||
                (feature.propertyValues[this.filter.propertyIndex] == this.filter.value)
            )) {
                this.filterFeatures.push({id: id, geometry: geometry, feature: feature});
            }
        } else {  // POJO feature.
            var geometries = getFeatureValues(feature, this.geometryPropertyName);
            if (geometries[0] == null) {
                continue;
            }
            var ids = getFeatureValues(feature, this.idPropertyName);
            if ((ids[0] == null) || (ids.length != geometries.length)) {
                ids = null;
            }
            var filterValues = null;
            if ((this.filter != null) && (this.filter.propertyName != null) && (this.filter.propertyName != "")) {
                filterValues = getFeatureValues(feature, this.filter.propertyName);
                if (filterValues.length != geometries.length) {
                    continue;
                }
            }
            
            for (var j = 0; j < geometries.length; j++) {
                if ((this.filter != null) && (this.filter.propertyName != null) && (
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.EQUALS)            && (i != this.filter.value)) ||                 // e.g. "== 0", the first feature
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.LESS_OR_EQUALS)    && !(i <= this.filter.value)) ||                // e.g. "<= 2", the first 3 features
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.GREATER_OR_EQUALS) && !(i >= this.filter.value)) ||                // e.g. ">= 6", all features, except first 5
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.EQUALS)            && (filterValues[j] != this.filter.value)) ||   // e.g. "foo == bar"
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.LESS_OR_EQUALS)    && !(filterValues[j] <= this.filter.value)) ||  // e.g. "foo <= bar"
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.GREATER_OR_EQUALS) && !(filterValues[j] >= this.filter.value))     // e.g. "foo >= bar"
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
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.setVertices();
    }
    this.setMapFeatures();
}

MapFeatureModel.prototype.setGeometries = function(geometries) {
    this.geometries = geometries;
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.setVertices();
    }
    this.setMapFeatures();
}

MapFeatureModel.prototype.setGeometry = function(geometry) {
    this.geometry = geometry;
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.setVertices();
    }
    this.setMapFeatures();
}

MapFeatureModel.prototype.setAnimating = function(animating) {
    this.animating = animating;
    if (!this.animate) {
        this.setMapFeatures();
    }
}

MapFeatureModel.prototype.setVertices = function() {  // Only works with point geometries.
    this.vertices = [];
    var graphicSize = parseFloat(this.css.getPropertyValue("--graphic-size") || 8);
    
    if (this.features != null) {
        for (var i = 0; i < this.filterFeatures.length; i++) {
            this.vertices.push(this.filterFeatures[i].geometry.x);
            this.vertices.push(this.filterFeatures[i].geometry.y);
            
            if (this.cssFunction != null) {
                var css = {};
                this.cssFunction(css, this.filterFeatures[i]);
                if (css.graphicSize != null) {
                    this.vertices.push(Math.min(css.graphicSize, graphicSize) / graphicSize);
                } else {
                    this.vertices.push(1);
                }
            } else {
                this.vertices.push(1);
            }
        }
    } else if (this.geometries != null) {
        for (var i = 0; i < this.geometries.length; i++) {
            this.vertices.push(this.geometries[i].x);
            this.vertices.push(this.geometries[i].y);
            this.vertices.push(1);
        }
    } else {  // this.geometry != null
        this.vertices.push(this.geometry.x);
        this.vertices.push(this.geometry.y);
        this.vertices.push(1);
    }
    
    //console.log("Number of points: " + (this.vertices.length / 3));
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(this.vertices), this.ctx.STATIC_DRAW);
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
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.ctx.viewport(0, 0, this.bounds.width, this.bounds.height);
        //this.ctx.clearColor(0, 0, 0, 0);
        //this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
    } else if (this.ctx != null) {
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
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.ctx.uniform4f(this.glShaderCenter, this.centerScale.centerX, this.centerScale.centerY, 0, 0);
        this.ctx.uniform4f(this.glShaderScale, this.centerScale.getNumWorldCoords(this.bounds.width) / 2, this.centerScale.getNumWorldCoords(this.bounds.height) / 2, 1, 1);
        
        this.ctx.drawArrays(this.ctx.POINTS, 0, this.vertices.length / 3);
        return;
    }
    
    var css = { };
    if (this.ctx != null) {
        var scaling = this.centerScale.getNumPixs(1);
        var dx = -this.centerScale.centerX * scaling + this.bounds.width / 2;
        var dy = this.centerScale.centerY * scaling + this.bounds.height / 2;
        this.ctx.setTransform(scaling, 0, 0, -scaling, dx, dy);
        
        this.ctx.fillStyle = css.fill = this.css.getPropertyValue("fill");
        this.ctx.strokeStyle = css.stroke = this.css.getPropertyValue("stroke");
        this.ctx.lineWidth = css.scaledStrokeWidth = (css.strokeWidth = parseFloat(this.css.getPropertyValue("stroke-width") || 1)) / scaling;
        
        css.strokeFilter = this.css.getPropertyValue("--stroke-filter") || "none";
        css.scaledGraphicSize = (css.graphicSize = parseFloat(this.css.getPropertyValue("--graphic-size") || 8) + 1) / scaling;
    }
    
    if (this.features != null) {
        for (var i = 0; i < this.filterFeatures.length; i++) {
            if (this.cssFunction != null) {  // Implies a canvas.
                this.cssFunction(css, this.filterFeatures[i]);
                var scaling = this.centerScale.getNumPixs(1);
                
                this.ctx.fillStyle = css.fill;
                this.ctx.strokeStyle = css.stroke;
                this.ctx.lineWidth = css.scaledStrokeWidth = parseFloat(css.strokeWidth) / scaling;
                
                css.scaledGraphicSize = parseFloat(css.graphicSize) / scaling;
            }
            
            var geometry = this.filterFeatures[i].geometry;
            if (geometry instanceof Geometry) {
                this.assignGeometry(this.filterFeatures[i], geometry, css);
            } else {  // geometry is a path string that renders on a (transformed) canvas.
                this.drawPath(geometry, css.strokeFilter);
            }
        }
    } else if (this.geometries != null) {
        for (var i = 0; i < this.geometries.length; i++) {
            this.assignGeometry(null, this.geometries[i], css);
        }
    } else {  // this.geometry != null
        this.assignGeometry(null, this.geometry, css);
    }
}

MapFeatureModel.prototype.assignGeometry = function(mapFeature, geometry, css) {
    if (this.envelopeCheck && !geometry.intersects(this.envelope)) {
        return;
    }
    
    if (mapFeature != null) {
        this.mapFeatures.push(mapFeature);
    }
    
    if (geometry instanceof Point) {
        if (this.ctx != null) {
            this.ctx.beginPath();
            this.ctx.arc(geometry.x, geometry.y, css.scaledGraphicSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.filter = css.strokeFilter;
            this.ctx.stroke();
            this.ctx.filter = "none";
        } else {
            this.points.push(geometry);
        }
    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
        if (this.ctx != null) {
            var path = (new SVGConverter()).geometryToCoordPath(geometry);
            this.drawPath(path, css.strokeFilter);
        } else {
            this.nonPointGeometries.push(geometry);
            if (this.includePoints) {
                Array.prototype.push.apply(this.points, geometry.getPoints());
            }
        }
    } else {  // Multi-geometry or geometry collection.
        for (var i = 0; i < geometry.childGeometries.length; i++) {
            this.assignGeometry(null, geometry.childGeometries[i], css);
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

