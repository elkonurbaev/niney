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
    this.includePoints = false;
    this.fillRule = "evenodd";
    this.ctxShared = false;
    this.cssFunction = null;
    this.label = false;
    
    this.patterns = null;
    this.ctx = null;
    this.ctxHasSnoopMargin = false;
    this.style = null;
    
    this.inverseFillPath = "";
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
        var match = filterExpression.match(/(\[(\d+)\]|[\w\.]*)\s*([=<>]=)\s*(.*)/);  // Does not support IN operator.
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
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.EQUALS)            && (i != this.filter.value)) ||                  // e.g. "== 0", the first feature
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.LESS_OR_EQUALS)    && !(i <= this.filter.value)) ||                 // e.g. "<= 2", the first 3 features
                    ((this.filter.propertyName == "") && (this.filter.operator == FilterModel.GREATER_OR_EQUALS) && !(i >= this.filter.value)) ||                 // e.g. ">= 6", all features, except first 5
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.EQUALS)            && (filterValues[j] != this.filter.value)) ||    // e.g. "foo == bar"
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.LESS_OR_EQUALS)    && !(filterValues[j] <= this.filter.value)) ||   // e.g. "foo <= bar"
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.GREATER_OR_EQUALS) && !(filterValues[j] >= this.filter.value)) ||   // e.g. "foo >= bar"
                    ((this.filter.propertyName != "") && (this.filter.operator == FilterModel.IN)                && !this.filter.value.includes(filterValues[j])) // e.g. "foo IN [bar]"
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
    var graphicSize = parseFloat(this.style.getPropertyValue("--graphic-size") || 8);
    
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
    if ((this.envelope == null) && this.envelopeCheck) {
        return;
    }
    
    if (this.ctx instanceof WebGLRenderingContext) {
        this.ctx.viewport(0, 0, this.bounds.width, this.bounds.height);
        //this.ctx.clearColor(0, 0, 0, 0);
        //this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
    } else if (this.ctx != null) {
        if (!this.ctxShared) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);  // ctx.resetTransform();
            this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
        }
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
    
    var css = {};
    if (this.ctx != null) {
        var scaling = this.centerScale.getNumPixs(1);
        var yFactor = this.centerScale.yFactor;
        var dx = this.bounds.width / 2 - this.centerScale.centerX * scaling;
        var dy = this.bounds.height / 2 - this.centerScale.centerY * scaling * yFactor;
        this.ctx.setTransform(scaling, 0, 0, scaling * yFactor, dx, dy);
        
      if (this.style.getPropertyValue("fill").match(/^url/))
       (this.ctx.fillStyle   = css.fill                                           = this.patterns[this.style.getPropertyValue("fill")]).setTransform({a: 1 / scaling, b: 0, c: 0, d: 1 / scaling, e: 0, f: 0});
      else
        this.ctx.fillStyle   = css.fill                                           =               this.style.getPropertyValue("fill");
        this.ctx.strokeStyle = css.stroke                                         =               this.style.getPropertyValue("stroke");
        this.ctx.lineWidth   = css.scaledStrokeWidth      = (css.strokeWidth      =    parseFloat(this.style.getPropertyValue("stroke-width").replace(/^([\d.]{4})[\d]+/, "$1"))) / scaling;  // Max significance of 3, e.g. 1.25 or 12.5 or 10.
      if (this.style.getPropertyValue("stroke-dasharray") != "none")
        this.ctx.setLineDash(  css.scaledStrokeDasharray  = (css.strokeDasharray  =               this.style.getPropertyValue("stroke-dasharray").split(/[, ]+/).map(a => parseFloat(a))).map(a => a / scaling));
        this.ctx.lineCap     = css.strokeLinecap                                  =               this.style.getPropertyValue("stroke-linecap");
        this.ctx.lineJoin    = css.strokeLinejoin                                 =               this.style.getPropertyValue("stroke-linejoin");
        /*    Will be    */    css.strokeFilter                                   =               this.style.getPropertyValue("--stroke-filter") || "none";
        /*    applied    */    css.scaledGraphicSize      = (css.graphicSize      =    parseFloat(this.style.getPropertyValue("--graphic-size") || 8) + 1) / scaling;
        /*    to ctx     */    css.inverseFill     = this.ctxHasSnoopMargin? false:    !!parseInt(this.style.getPropertyValue("--inverse-fill") || 0);
        /*      in       */    css.confineFill                                    =    !!parseInt(this.style.getPropertyValue("--confine-fill") || 0);
        /*   due time.   */    css.scaledConfineFillWidth = (css.confineFillWidth =    parseFloat(this.style.getPropertyValue("stroke-width").replace(/^[\d.]{1,4}|px$/g, "") || 12)) / scaling;  // No decimal point allowed. No trailing zero allowed, e.g. 10 must be 9 or 11.
        this.ctx.font       = (css.scaledFontSize         = (css.fontSize         =    parseFloat(this.style.getPropertyValue("font-size"))) / scaling) + "px "
                                                          + (css.fontFamily       =               this.style.getPropertyValue("font-family"));
        this.ctx.textAlign    = "center";
        this.ctx.textBaseline = "middle";
        
        this.startInverseFill(css);
    }
    
    if (this.features != null) {
        for (var i = 0; i < this.filterFeatures.length; i++) {
            if (this.cssFunction != null) {  // Implies a canvas.
                var scaling = this.centerScale.getNumPixs(1);
                this.cssFunction(css, this.filterFeatures[i], scaling);
                
              if (css.fill instanceof CanvasPattern)
               (this.ctx.fillStyle   = css.fill).setTransform({a: 1 / scaling, b: 0, c: 0, d: 1 / scaling, e: 0, f: 0});
              else
                this.ctx.fillStyle   = css.fill;
                this.ctx.strokeStyle = css.stroke;
                this.ctx.lineWidth   = css.scaledStrokeWidth     = parseFloat(css.strokeWidth) / scaling;
              if (css.strokeDasharray != null)
                this.ctx.setLineDash(  css.scaledStrokeDasharray =            css.strokeDasharray.map(a => parseFloat(a) / scaling));
                this.ctx.lineCap     = css.strokeLinecap;
                this.ctx.lineJoin    = css.strokeLinejoin;
                                       css.scaledGraphicSize     = parseFloat(css.graphicSize) / scaling;
                this.ctx.font       = (css.scaledFontSize        = parseFloat(css.fontSize) / scaling) + "px " + css.fontFamily;
            }
            
            this.assignGeometry(this.filterFeatures[i], this.filterFeatures[i].geometry, css);
        }
    } else if (this.geometries != null) {
        for (var i = 0; i < this.geometries.length; i++) {
            this.assignGeometry(null, this.geometries[i], css);
        }
    } else {  // this.geometry != null
        this.assignGeometry(null, this.geometry, css);
    }
    
    if (this.ctx != null) {
        this.completeInverseFill(css);
    }
}

MapFeatureModel.prototype.startInverseFill = function(css) {
    if (!css.inverseFill) {
        return;
    }
    
    var t = this.ctx.getTransform();
    var c = this.ctx.canvas;
    var envelope = (new Envelope(-t.e / t.a, -(t.f - c.height) / t.d, -(t.e - c.width) / t.a, -t.f / t.d)).grow(1.1);
    var path = "M" + envelope.minX + " " + envelope.maxY + " H" + envelope.maxX + " V" + envelope.minY + " H" + envelope.minX + " Z ";
    if (!css.confineFill) {
        this.inverseFillPath = path;
    } else {
        this.ctx.fill(new Path2D(path), this.fillRule);
    }
}

MapFeatureModel.prototype.assignGeometry = function(mapFeature, geometry, css) {
    if (this.envelopeCheck && !geometry.intersects(this.envelope)) {
        return;
    }
    
    if (mapFeature != null) {
        if (this.ctx != null) {
        } else {
            this.mapFeatures.push(mapFeature);
        }
    }
    
    if (!(geometry instanceof Geometry)) {  // geometry is a path string that renders on a (transformed) canvas.
        this.drawPath(geometry, css);
    } else if (geometry instanceof Point) {
        if (this.ctx != null) {
            this.ctx.beginPath();
            if (css.rectWidth) {
                var scaling = this.centerScale.getNumPixs(1);
                var scaledOffsetX = css.offsetX / scaling;
                var scaledRectWidth = css.rectWidth / scaling;
                var scaledRectHeight = css.rectHeight / scaling;
                this.ctx.rect(geometry.x + scaledOffsetX, geometry.y, scaledRectWidth, scaledRectHeight);
            } else {
                this.ctx.arc(geometry.x, geometry.y, css.scaledGraphicSize / 2, 0, 2 * Math.PI);
            }
            this.ctx.fill();
            this.ctx.filter = css.strokeFilter;
            this.ctx.stroke();
            this.ctx.filter = "none";
        } else {
            this.points.push(geometry);
        }
    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
        if (this.ctx != null) {
            var path = (new SVGConverter()).geometryToWorldPath(geometry);
            this.drawPath(path, css);
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

MapFeatureModel.prototype.completeInverseFill = function(css) {
    if (!css.inverseFill) {
        return;
    }
    
    if (!css.confineFill) {
        this.drawPath(this.inverseFillPath, css, true);
        this.inverseFillPath = "";
    }
}

MapFeatureModel.prototype.drawPath = function(path, css, last) {
    if (this.label) {
        this.drawText(css);
        return;
    }
    
    if (css.inverseFill && !css.confineFill && !last) {
        this.inverseFillPath += path;
        return;
    }
    
    var stroke = !this.ctxShared? new Path2D(path): new Path2D(path.replace(/K/g, "M").replace(/Z/g, ""));
    if (css.fill != "none") {
        if (!css.confineFill) {
            var fill = !this.ctxShared? stroke: new Path2D(path.replace(/K/g, "L"));
            this.ctx.fill(fill, this.fillRule);
        } else if (!css.inverseFill) {
            var backupStyles = {strokeStyle: this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth};
            this.ctx.strokeStyle = css.fill;
            this.ctx.lineWidth   = css.scaledConfineFillWidth;
            this.ctx.stroke(stroke);
            Object.assign(this.ctx, backupStyles);
        }
    }
    this.ctx.filter = css.strokeFilter;
    this.ctx.stroke(stroke);
    this.ctx.filter = "none";
}

MapFeatureModel.prototype.drawText = function(css) {
    if ((css.labelText == null) || (css.labelPoint == null)) {
        return;
    }
    
    this.ctx.strokeText(css.labelText, css.labelPoint.x, css.labelPoint.y);
    this.ctx.fillText(css.labelText, css.labelPoint.x, css.labelPoint.y);
}

