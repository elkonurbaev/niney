

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "mergejs.txt" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Sat Sep 14 20:47:31 CEST 2019  */

/* Merging order :

- utils/BoundsModel.js
- utils/Bounds.js
- utils/Timer.js
- utils/AnimationTimer.js
- utils/PanSpeedTimer.js
- geometrymodel/Geometry.js
- geometrymodel/GeometryCollection.js
- geometrymodel/Point.js
- geometrymodel/Envelope.js
- geometrymodel/GeometryTools.js
- geometrymodel/LineString.js
- geometrymodel/Polygon.js
- geometrymodel/converters/WKTConverter.js
- geometrymodel/converters/SVGConverter.js
- geometrymodel/converters/CSSConverter.js
- featuremodel/Feature.js
- featuremodel/FeatureModel.js
- featuremodel/FeatureType.js
- featuremodel/Property.js
- featuremodel/PropertyType.js
- featuremodel/commands/EmptyFeatureCommand.js
- featuremodel/commands/SelectFeatureCommand.js
- featuremodel/commands/AggressiveSelectFeatureCommand.js
- featuremodel/commands/ToggleSelectFeatureCommand.js
- featuremodel/commands/ToURLFeatureCommand.js
- featuremodel/converters/CSVConverter.js
- filtermodel/FilterModel.js
- filtermodel/Filter.js
- filtermodel/converters/URLFilterConverter.js
- focusmodel/CenterScale.js
- focusmodel/FocusModel.js
- focusmodel/EnvelopeModel.js
- focusmodel/ZoomLevel.js
- focusmodel/SRS.js
- mapcontroller/MapController.js
- layermodel/Layer.js
- layermodel/Loader.js
- layermodel/Tile.js
- layermodel/TileModel.js
- layermodel/UTFGridModel.js
- layermodel/WMSModel.js
- layermodel/MapFeatureModel.js
- layermodel/protocols/WMSProtocol.js
- selectionmodel/SelectionModel.js
- stylemodel/converters/URLClassificationConverter.js
- niney.es2015.js

*/


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils/BoundsModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function BoundsModel() {
    this.incubationTimer = new Timer(1000, 1);
    this.bounds = null;
    this.incubationBounds = null;
    
    var boundsModel = this;
    this.incubationTimer.timerHandler = function() {
        boundsModel.incubationBounds = boundsModel.bounds;
    };
}

BoundsModel.prototype.setBounds = function(bounds) {
    if (this.bounds == null) {
        this.bounds = bounds;
        this.incubationBounds = bounds;
        return;
    }
    if (this.bounds.equals(bounds)) {
        return;
    }
    
    this.bounds = bounds;
    this.setIncubationBounds();
}

BoundsModel.prototype.setIncubationBounds = function() {
    this.incubationTimer.reset();
    this.incubationTimer.start();
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils/Bounds.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Bounds(width, height) {
    this.width = width;
    this.height = height;
}

Bounds.prototype.equals = function(o) {
    return ((o != null) && (this.width == o.width) && (this.height == o.height));
};



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils/Timer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Timer(delay, numRepeats) {
    this.delay = delay;
    this.numRepeats = numRepeats;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
}

Timer.prototype.start = function() {
    if ((this.interval == -1) && ((this.currentCount < this.numRepeats) || (this.numRepeats == -1))) {
        var timer = this;
        this.interval = setInterval(function() {
            timer.currentCount++;
            timer.tick();
            if (timer.currentCount == timer.numRepeats) {
                timer.stop();
            }
        }, this.delay);
    }
};

Timer.prototype.stop = function() {
    if (this.interval != -1) {
        clearInterval(this.interval);
        this.interval = -1;
    }
};

Timer.prototype.reset = function() {
    this.stop();
    this.currentCount = 0;
};

Timer.prototype.isRunning = function() {
    return (this.interval != -1);
};

Timer.prototype.tick = function() {
    if (this.scope != null) {
        this.scope.$apply(this.timerHandler);
    } else {
        this.timerHandler.apply();
    }
};



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils/AnimationTimer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function AnimationTimer(duration) {
    this.delay = -1;
    this.numRepeats = -1;
    this.currentCount = 0;  // now - startTime
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
    
    this.duration = duration;
    this.startTime = -1;
}

AnimationTimer.prototype = new Timer();
AnimationTimer.prototype.constructor = AnimationTimer;

AnimationTimer.prototype.start = function() {
    if (this.interval == -1) {
        this.startTime = performance.now();
        var timer = this;
        this.interval = window.requestAnimationFrame(preTick);
        
        function preTick() {
            timer.currentCount = performance.now() - timer.startTime;
            if ((timer.duration > -1) && (timer.currentCount > timer.duration)) {
                timer.currentCount = timer.duration;
                timer.tick();
                timer.stop();
            } else {
                timer.tick();
                timer.interval = window.requestAnimationFrame(preTick);
            }
        }
    }
};

AnimationTimer.prototype.stop = function() {
    if (this.interval != -1) {
        window.cancelAnimationFrame(this.interval);
        this.interval = -1;
        this.startTime = -1;
        this.currentCount = 0;
    }
};

AnimationTimer.prototype.reset = function() {
    this.stop();
};



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils/PanSpeedTimer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function PanSpeedTimer() {
    this.delay = -1;
    this.numRepeats = -1;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
    
    this.duration = -1;
    this.startTime = -1;
    
    this.panned = false;
    this.panEvents = [];
}

PanSpeedTimer.prototype = new AnimationTimer();
PanSpeedTimer.prototype.constructor = PanSpeedTimer;

PanSpeedTimer.prototype.start = function(panEvent) {
    panEvent.time = performance.now();
    this.panEvents.push(panEvent);
    
    AnimationTimer.prototype.start.call(this);
}

PanSpeedTimer.prototype.resetAndGetSpeed = function(panEvent) {
    var speed = {h: 0, v: 0, z: 1};
    
    if (panEvent.touches == null) {
        this.push(panEvent);
    } else {
        // For touch events, make sure that only events with the same number of touches are included in the speed calculation.
        var eventSeries = [];
        for (var i = 0; i < this.panEvents.length; i++) {
            // Group them in series of subsequent events with the same number of touches.
            if ((i == 0) || (this.panEvents[i].touches.length != this.panEvents[i - 1].touches.length)) {
                eventSeries.push([this.panEvents[i]]);
            } else {
                eventSeries[eventSeries.length - 1].push(this.panEvents[i]);
            }
        }
        this.panEvents = eventSeries.sort(function(a, b) { return b.length - a.length; })[0];  // Select the event series with the most members.
        panEvent = this.panEvents[this.panEvents.length - 1];
    }
    var previousEvent = this.panEvents[0];
    var timeSpan = panEvent.time - previousEvent.time;
    if (timeSpan > 0) {
        speed.h = (panEvent.clientX - previousEvent.clientX) / timeSpan;
        speed.v = (panEvent.clientY - previousEvent.clientY) / timeSpan;
        if (panEvent.touches != null) {
            speed.z = Math.pow(panEvent.radius / previousEvent.radius, 1 / timeSpan);
        }
    }
    
    this.panned = false;
    this.panEvents = [];
    
    AnimationTimer.prototype.reset.call(this);
    
    return speed;
}

PanSpeedTimer.prototype.push = function(panEvent) {
    panEvent.time = performance.now();
    this.panned = true;
    this.panEvents.push(panEvent);
    while (panEvent.time - this.panEvents[0].time > 100) {
        this.panEvents.shift();
    }
}

export function decorateTouchEvent(touchEvent, lastTouchOnly) {
    if (touchEvent.touches == null) {  // Not a touch event.
        return;
    }
    
    var touch = touchEvent.touches[touchEvent.touches.length - 1];
    if (touchEvent.touches.length == 0) {
        touchEvent.clientX = touchEvent.changedTouches[0].clientX;
        touchEvent.clientY = touchEvent.changedTouches[0].clientY;
        touchEvent.radius = 1;
    } else if ((touchEvent.touches.length == 1) || lastTouchOnly) {
        touchEvent.clientX = touch.clientX;
        touchEvent.clientY = touch.clientY;
        touchEvent.radius = 1;
    } else {  // 2 or more touches.
        var minX = touch.clientX;
        var minY = touch.clientY;
        var maxX = touch.clientX;
        var maxY = touch.clientY;
        for (var i = 0; i < touchEvent.touches.length - 1; i++) {
            touch = touchEvent.touches[i];
            if (minX > touch.clientX) {
                minX = touch.clientX;
            }
            if (minY > touch.clientY) {
                minY = touch.clientY;
            }
            if (maxX < touch.clientX) {
                maxX = touch.clientX;
            }
            if (maxY < touch.clientY) {
                maxY = touch.clientY;
            }
        }
        touchEvent.clientX = (minX + maxX) / 2;
        touchEvent.clientY = (minY + maxY) / 2;
        touchEvent.radius = Math.sqrt((maxX - minX) * (maxX - minX) + (maxY - minY) * (maxY - minY));
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Geometry.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Geometry() {
    this.$parent = null;  // Starts with $ to prevent recursion in angular.equals (geometry.childGeometries[0].$parent == geometry and so on).
    this.childGeometries = [];
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
    var points = [];
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

Geometry.prototype.intersects = function(geometry) {
    return this.getEnvelope().intersects(geometry);
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



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/GeometryCollection.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


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


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Point.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Point(x, y) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
Point.prototype.constructor = Point;

Point.prototype.addChild = function(child) { }

Point.prototype.removeChild = function(child) { }

Point.prototype.getPoints = function() {
    return [this];
}

Point.prototype.getEndPoint = function() {
    return this;
}

Point.prototype.getCenterPoint = function() {
    return this.clone();
}

Point.prototype.getEnvelope = function() {
    if (this.envelope == null) {
        this.envelope = new Envelope(this.x, this.y, this.x, this.y);
    }
    return this.envelope;
}

Point.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return this.equals(geometry);
    }
    
    if (geometry instanceof Polygon) {
        var numWindings = 0;
        var points = geometry.getPoints();
        for (var i = 0; i < points.length - 1; i++) {
            if (points[i].y <= this.y) {
                if ((points[i + 1].y > this.y) && (this.isLeft(points[i], points[i + 1]) > 0)) {
                    numWindings++;
                }
            } else {
                if ((points[i + 1].y <= this.y) && (this.isLeft(points[i], points[i + 1]) < 0)) {
                    numWindings--;
                }
            }
        }
        return numWindings != 0;
    }
    
    if (geometry instanceof Envelope) {
        return (
            (this.x >= geometry.minX) &&
            (this.y >= geometry.minY) &&
            (this.x <= geometry.maxX) &&
            (this.y <= geometry.maxY)
        );
    }
    
    return this.intersects(geometry.getEnvelope());
}

Point.prototype.isLeft = function(point0, point1) {
    return (point1.x - point0.x) * (this.y - point0.y) - (this.x -  point0.x) * (point1.y - point0.y);
}

Point.prototype.equals = function(geometry) {
    if (!(geometry instanceof Point)) {
        return false;
    }
    if ((this.x == geometry.x) && (this.y == geometry.y)) {
        return true;
    }
    return false;
}

Point.prototype.clone = function() {
    return new Point(this.x, this.y);
}

Point.prototype.getDistance = function(point) {
    var dx = this.x - point.x;
    var dy = this.y - point.y;
    var distance = Math.sqrt((dx * dx) + (dy * dy));
    return distance;
}

Point.prototype.setXY = function(x, y) {
    this.x = x;
    this.y = y;
    
    this.invalidateEnvelope();
}

Point.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    
    this.invalidateEnvelope();
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Envelope.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Envelope(minX, minY, maxX, maxY) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    
    var point0 = new Point(minX, minY);
    var point1 = new Point(maxX, maxY);
    point0.setParent(this);
    point1.setParent(this);
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.getEnvelope = function() {
    if (this.envelope == null) {
        this.envelope = this.clone();
    }
    return this.envelope;
}

Envelope.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return geometry.intersects(this);
    }
    
    if (geometry instanceof Envelope) {
        return (
            (this.minX <= geometry.maxX) &&
            (this.minY <= geometry.maxY) &&
            (this.maxX >= geometry.minX) &&
            (this.maxY >= geometry.minY)
        );
    }
    
    return this.intersects(geometry.getEnvelope());
}

Envelope.prototype.equals = function(geometry) {
    if (!(geometry instanceof Envelope)) {
        return false;
    }
    
    return (
        (this.minX == geometry.minX) &&
        (this.minY == geometry.minY) &&
        (this.maxX == geometry.maxX) &&
        (this.maxY == geometry.maxY)
    );
}

Envelope.prototype.clone = function() {
    return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}

Envelope.prototype.invalidateEnvelope = function() {
    Geometry.prototype.invalidateEnvelope.call(this);
    
    if (this.childGeometries[0].x <= this.childGeometries[1].x) {
        this.minX = this.childGeometries[0].x;
        this.maxX = this.childGeometries[1].x;
    } else {
        this.minX = this.childGeometries[1].x;
        this.maxX = this.childGeometries[0].x;
    }
    if (this.childGeometries[0].y <= this.childGeometries[1].y) {
        this.minY = this.childGeometries[0].y;
        this.maxY = this.childGeometries[1].y;
    } else {
        this.minY = this.childGeometries[1].y;
        this.maxY = this.childGeometries[0].y;
    }
}

Envelope.prototype.getWidth = function() {
    return this.maxX - this.minX;
}

Envelope.prototype.getHeight = function() {
    return this.maxY - this.minY;
}

Envelope.prototype.grow = function(factor) {
    var displacementFactor = (factor - 1) / 2;
    var dx = this.getWidth() * displacementFactor;
    var dy = this.getHeight() * displacementFactor;
    var minX = this.minX - dx;
    var minY = this.minY - dy;
    var maxX = this.maxX + dx;
    var maxY = this.maxY + dy;
    
    this.childGeometries[0].setXY(minX, minY);
    this.childGeometries[1].setXY(maxX, maxY);
    
    this.invalidateEnvelope();
}

Envelope.prototype.toString = function() {
    return "Envelope(" + this.minX + ", " + this.minY + ", " + this.maxX + ", " + this.maxY + ")";
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/GeometryTools.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function GeometryTools() { }

GeometryTools.getGeometryClass = function(geometryType) {
    geometryType = geometryType.toUpperCase();
    if (geometryType == "POINT") {
        return Point;
    } else if (geometryType == "ENVELOPE") {
        return Envelope;
    } else if (geometryType == "CIRCLE") {
        return Circle;
    } else if (geometryType == "LINESTRING") {
        return LineString;
    } else if (geometryType == "POLYGON") {
        return Polygon;
    }
    return null;
}

GeometryTools.transform = function(geometry, srid) {
    if (geometry == null) {
        throw new Error("No geometry given.");
    }
    if (!(geometry instanceof Point)) {
        throw new Error("Given geometry is not a point. Only point geometries are currently supported.");
    }
    var point = geometry;
    
    if ((point.srid == 4326) && (srid == 900913)) {
        var x = point.x * 20037508.3427892 / 180;
        var y = Math.log(Math.tan((90 + point.y) * Math.PI / 360)) * 180 / Math.PI;
        y = y * 20037508.3427892 / 180;
        point = new Point(x, y);
        point.srid = srid;
        return point;
    } else if ((point.srid == 900913) && (srid == 4326)) {
        var x = point.x * 180 / 20037508.3427892;
        var y = point.y * 180 / 20037508.3427892;
        y = Math.atan(Math.exp(y / 180 * Math.PI)) * 360 / Math.PI - 90;
        point = new Point(x, y);
        point.srid = srid;
        return point;
    }
    
    throw new Error("Given SRID transformation is currently not supported.");
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/LineString.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


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



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Polygon.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Polygon(lineStrings) {
    this.$parent = null;
    this.childGeometries = [];
    this.envelope = null;
    
    if ((lineStrings == null) || (lineStrings.length < 1)) {
        return;
    }
    
    for (var i = 0; i < lineStrings.length; i++) {
        lineStrings[i].setParent(this);
    }
}

Polygon.prototype = new Geometry();
Polygon.prototype.constructor = Polygon;

Polygon.prototype.getPoints = function() {
    return this.childGeometries[0].getPoints();
}

Polygon.prototype.intersects = function(geometry) {
    if (geometry instanceof Point) {
        return geometry.intersects(this);
    }
    
    return this.getEnvelope().intersects(geometry);
}

Polygon.prototype.clone = function() {
    var clonedLineStrings = [];
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedLineStrings.push(this.childGeometries[i].clone());
    }
    return new Polygon(clonedLineStrings);
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/WKTConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function WKTConverter() {
    this.sridRegExp = /^"?SRID=(\d+);(.*)/;
    this.geometryCollectionRegExp = /^"?GEOMETRYCOLLECTION\s?\((.*?)\)"?$/;
    this.multiGeometryRegExp = /^"?MULTI(POINT|LINESTRING|POLYGON)\s?\((.*?)\)"?$/;
    this.pointRegExp = /^"?POINT\s?\(([-\d\s\.]*)\)"?$/;
    this.lineStringRegExp = /^"?LINESTRING\s?\(([-\d\s\.,]*)\)"?$/; 
    this.polygonRegExp = /^"?POLYGON\s?\(([-\d\s\.,\(\)]*)\)"?$/;
}

WKTConverter.prototype.wktToGeometry = function(wkt) {
    var sridString = null;
    if (wkt.search(this.sridRegExp) == 0) {
        sridString = wkt.replace(this.sridRegExp, "$1");
        wkt = wkt.replace(this.sridRegExp, "$2");
    }
    
    var geometry = null;
    if (wkt.search(this.geometryCollectionRegExp) == 0) {
        geometry = this.wktToGeometryCollection(wkt);
    } else if (wkt.search(this.multiGeometryRegExp) == 0) {
        geometry = this.wktToMultiGeometry(wkt);
    } else if (wkt.search(this.pointRegExp) == 0) {
        geometry = this.wktToPoint(wkt);
    } else if (wkt.search(this.lineStringRegExp) == 0) {
        geometry = this.wktToLineString(wkt);
    } else if (wkt.search(this.polygonRegExp) == 0) {
        geometry = this.wktToPolygon(wkt);
    }
    
    if ((geometry != null) && (sridString != null) && (sridString != "") && (sridString != "900913")) {
        geometry.srid = parseInt(sridString);
        geometry = GeometryTools.transform(geometry, 900913);
    }
    
    return geometry;
}

WKTConverter.prototype.wktToGeometryCollection = function(wkt) {
    var geometries = [];
    wkt = wkt.match(this.geometryCollectionRegExp)[1];
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        var closingBrackets = wkt.match(/^(POINT|LINESTRING|POLYGON)(\(\(?)/)[2].replace(/\(/g, ")");
        i = wkt.indexOf(closingBrackets) + closingBrackets.length;
        geometries.push(this.wktToGeometry(wkt.substring(0, i)));
    }
    return new GeometryCollection(geometries);
}

WKTConverter.prototype.wktToMultiGeometry = function(wkt) {
    var geometries = [];
    var match = wkt.match(this.multiGeometryRegExp);
    var geometryType = match[1];
    wkt = match[2];
    var closingBrackets = wkt.match(/^\(\(?/)[0].replace(/\(/g, ")");
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        i = wkt.indexOf(closingBrackets) + closingBrackets.length;
        geometries.push(this.wktToGeometry(geometryType + wkt.substring(0, i)));
    }
    return new GeometryCollection(geometries);
}

WKTConverter.prototype.wktToPoint = function(wkt) {
    wkt = wkt.match(this.pointRegExp)[1];
    var coordStrings = wkt.split(" ");
    return new Point(parseFloat(coordStrings[0]), parseFloat(coordStrings[1]));
}

WKTConverter.prototype.wktToLineString = function(wkt) {
    var points = [];
    wkt = wkt.match(this.lineStringRegExp)[1];
    var pointStrings = wkt.split(/,\s?/);
    for (var i = 0; i < pointStrings.length; ++i) {
        var coordStrings = pointStrings[i].split(" ");
        points.push(new Point(parseFloat(coordStrings[0]), parseFloat(coordStrings[1])));
    }
    return new LineString(points);
}

WKTConverter.prototype.wktToPolygon = function(wkt) {
    var lineStrings = [];
    wkt = wkt.match(this.polygonRegExp)[1];
    var closingBrackets = ")";
    for (var i = 0; i < wkt.length;) {
        wkt = wkt.substring(i).replace(/^,\s?/, "");
        i = wkt.indexOf(closingBrackets) + 1;
        lineStrings.push(this.wktToLineString("LINESTRING" + wkt.substring(0, i)));
    }
    return new Polygon(lineStrings);
}

WKTConverter.prototype.geometryToWKT = function(geometry) {
    if (geometry instanceof GeometryCollection) {
        return this.geometryCollectionToWKT(geometry);
    } else if (geometry instanceof Point) {
        return this.pointToWKT(geometry);
    } else if (geometry instanceof LineString) {
        return this.lineStringToWKT(geometry);
    } else if (geometry instanceof Polygon) {
        return this.polygonToWKT(geometry);
    }
    return null;
}

WKTConverter.prototype.geometryCollectionToWKT = function(geometryCollection) {
    var wkt = "GEOMETRYCOLLECTION(";
    for (var i = 0; i < geometryCollection.childGeometries.length; ++i) {
        wkt += this.geometryToWKT(geometryCollection.childGeometries[i]);
        if (i < geometryCollection.childGeometries.length - 1) {
            wkt += ",";
        }
    }
    return wkt + ")";
}

WKTConverter.prototype.pointToWKT = function(point) {
    return "POINT(" + point.x + " " + point.y + ")";
}

WKTConverter.prototype.lineStringToWKT = function(lineString) {
    return "LINESTRING" + this.childCoordsToWKT(lineString);
}

WKTConverter.prototype.polygonToWKT = function(polygon) {
    return "POLYGON" + this.childCoordsToWKT(polygon);
}

WKTConverter.prototype.childCoordsToWKT = function(geometry) {
    var wkt = "(";
    for (var i = 0; i < geometry.childGeometries.length; ++i) {
        var child = geometry.childGeometries[i];
        if (child instanceof Point) {
            wkt += child.x + " " + child.y;
        } else if (child.childGeometries.length > 0) {
            wkt += this.childCoordsToWKT(child);
        }
        if (i < geometry.childGeometries.length - 1) {
            wkt += ",";
        }
    }
    return wkt + ")";
}

WKTConverter.prototype.wktToCoordPath = function(wkt) {
    return wkt.replace(/[^\d]+$/, "").replace(/^[^\d]+([\d.\s]+),\s*/g, "M $1 L ").replace(/\)+,\s*\(+([\d.\s]+),\s*/g, " M $1 L ");
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/SVGConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function SVGConverter() { }

SVGConverter.prototype.geometryToPixPath = function(bounds, centerScale, geometry) {
    var path = "";
    var lineStrings = geometry.getLineStrings();
    for (var i = 0; i < lineStrings.length; i++) {
        path += "M ";
        var points = lineStrings[i].getPoints();
        for (var j = 0; j < points.length; j++) {
            if (j == 1) {
                path += "L ";
            }
            var x = centerScale.getPixX(bounds.width, points[j].x);
            var y = centerScale.getPixY(bounds.height, points[j].y);
            path += x + " " + y + " ";
        }
    }
    return path;
}

SVGConverter.prototype.geometryToCoordPath = function(geometry) {
    var path = "";
    var lineStrings = geometry.getLineStrings();
    for (var i = 0; i < lineStrings.length; i++) {
        path += "M ";
        var points = lineStrings[i].getPoints();
        for (var j = 0; j < points.length; j++) {
            if (j == 1) {
                path += "L ";
            }
            path += points[j].x + " " + points[j].y + " ";
        }
    }
    return path;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/CSSConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function CSSConverter() { }

CSSConverter.prototype.pointToPixCSS = function(bounds, centerScale, point) {
    return css = {
        left: Math.round(centerScale.getPixX(bounds.width, point.x)) + "px",
        top: Math.round(centerScale.getPixY(bounds.height, point.y)) + "px"
    };
}

CSSConverter.prototype.pointToWorldCSS = function(point) {
    return css = {
        left: Math.round(point.x) + "px",
        top: Math.round(point.y) + "px"
    };
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/Feature.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Feature(featureType, propertyValues) {
    this.featureType = featureType;
    this.propertyValues = propertyValues;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/FeatureModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function FeatureModel(features, type) {
    this.features = features;
    this.featureType = type;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/FeatureType.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function FeatureType(name, properties) {
    this.name = name;
    this.properties = properties;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/Property.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Property(name, type) {
    this.name = name;
    this.type = type;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/PropertyType.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function PropertyType() { }

PropertyType.prototype.BOOLEAN = "boolean";
PropertyType.prototype.DOUBLE = "double";
PropertyType.prototype.INTEGER = "integer";
PropertyType.prototype.STRING = "string";
PropertyType.prototype.GEOMETRY = "geometry";


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/EmptyFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function EmptyFeatureCommand() { }

EmptyFeatureCommand.prototype.perform = function() { }

export var defaultFeatureCommands = [new EmptyFeatureCommand(), new EmptyFeatureCommand(), new EmptyFeatureCommand()];



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/SelectFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function SelectFeatureCommand(selectionModel, index) {
    this.selectionModel = selectionModel;
    this.index = index;
}

SelectFeatureCommand.prototype.perform = function(feature) {
    if (this.selectionModel == null) {
        throw new Error("No selection model present.");
    }
    
    if (feature == null) {
        this.selectionModel.selectedFeatures[this.index] = null;
    } else if (this.selectionModel.selectedFeatures[this.index] == null) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    } else if (this.selectionModel.selectedFeatures[this.index] != feature) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/AggressiveSelectFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function AggressiveSelectFeatureCommand(selectionModel, index) {
    this.selectionModel = selectionModel;
    this.index = index;
}

AggressiveSelectFeatureCommand.prototype.perform = function(feature) {
    if (this.selectionModel == null) {
        throw new Error("No selection model present.");
    }
    
    if (feature == null) {
        this.selectionModel.selectedFeatures[this.index] = null;
    } else {
        this.selectionModel.selectedFeatures[this.index] = angular.copy(feature);
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/ToggleSelectFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function ToggleSelectFeatureCommand(selectionModel, index) {
    this.selectionModel = selectionModel;
    this.index = index;
    this.idPropertyName = null;
}

ToggleSelectFeatureCommand.prototype.perform = function(feature) {
    if (this.selectionModel == null) {
        throw new Error("No selection model present.");
    }
    
    if (feature == null) {
        this.selectionModel.selectedFeatures[this.index] = null;
    } else if (this.selectionModel.selectedFeatures[this.index] == null) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    } else if ((this.idPropertyName == null) && (this.selectionModel.selectedFeatures[this.index] != feature)) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    } else if ((this.idPropertyName != null) && (this.selectionModel.selectedFeatures[this.index][this.idPropertyName] != feature[this.idPropertyName])) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    } else {
        this.selectionModel.selectedFeatures[this.index] = null;
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/ToURLFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function ToURLFeatureCommand() { }

ToURLFeatureCommand.prototype.perform = function(feature) {
    if (feature == null) {
        throw new Error("No feature given.");
    }
    
    var urlString = this.getURL(feature.propertyValues);
    if (urlString != null) {
        window.open(this.getURL(feature.propertyValues));
    }
}

ToURLFeatureCommand.prototype.getURL = function(propertyValues) {
    if (propertyValues == null) {
        return null;
    }
    for (var i = 0; i < propertyValues.length; ++i) {
        if (this.isURL(propertyValues[i])) {
            return propertyValues[i];
        }
    }
    return null;
}

ToURLFeatureCommand.prototype.isURL = function(str) { 
    var regexp = new RegExp("^s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+$");
    return regexp.test(str);
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/converters/CSVConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function CSVConverter() { }

CSVConverter.prototype.csvToFeatures = function(csv, simple, fieldSeparator, textDelimiter, featureType) {
    var features = [];
    var lines = this.csvToLines(csv, simple, fieldSeparator, textDelimiter);
    var feature = null;
    var errorLines = [];
    for (var i = 0; i < lines.length; i++) {
        try {
            feature = this.lineToFeature(lines[i], featureType);
            features.push(feature);
        } catch (e) {
            errorLines.push(i);
        }
    }
    
    if (errorLines.length > 0) {
        throw new Error("Could not convert " + errorLines.length + " out of " + lines.length + " csv lines to features. Error lines: " + errorLines);
    }
    
    return features;
}

CSVConverter.prototype.csvToLines = function(csv, simple, fieldSeparator, textDelimiter) {
    csv = csv.replace(new RegExp("^\\s+"), "").replace(new RegExp("\\s+$"), ""); 
    if (simple) {
        lines = csv.split("\n");
        for (var h = 0; h < lines.length; h++) {
            lines[h] = lines[h].split(fieldSeparator);
        }
    } else {
        var endOfFile = false;
        var endOfLine = false;
        var i = -1;
        var j = -1;
        var fields = [];
        var lines = [];
        while (!endOfFile) {
            endOfLine = false;
            while (!endOfLine) {
                if (csv.indexOf(textDelimiter) == 0) {
                    csv = csv.substring(textDelimiter.length);
                    i = csv.search(new RegExp(textDelimiter + "($|\n|" + fieldSeparator + ")"));
                    j = i + textDelimiter.length;
                } else {
                    i = csv.search(new RegExp("($|\n|" + fieldSeparator + ")"));
                    j = i;
                }
                fields.push(csv.substring(0, i));
                csv = csv.substring(j);
                if (csv.indexOf(fieldSeparator) == 0) {
                    csv = csv.substring(fieldSeparator.length);
                } else if (csv.indexOf("\n") == 0) {
                    csv = csv.substring(1);
                    lines.push(fields);
                    fields = [];
                    endOfLine = true;
                } else if (csv.length == 0) {
                    lines.push(fields);
                    endOfFile = true;
                    endOfLine = true;
                }
            }
        }
    }
    
    return lines;
}

CSVConverter.prototype.lineToFeature = function(fields, featureType) {
    var properties = featureType.properties;
    if (fields.length != properties.length) {
        throw new Error("Number of fields of " + fields.length + " in the csv does not match the number of properties of " + properties.length + " in the featuretype.");
    }
    
    var propertyValues = [];
    var wktConverter = new WKTConverter();
    for (var i = 0; i < properties.length; i++) {
        if (fields[i] == "") {
            propertyValues.push(null);
        } else if (properties[i].type == PropertyType.prototype.GEOMETRY) {
            propertyValues.push(wktConverter.wktToGeometry(fields[i]));
        } else {
            propertyValues.push(fields[i]);
        }
    }
    
    return new Feature(featureType, propertyValues);
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: filtermodel/FilterModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function FilterModel() {
    this.filters = [];
    this.filter = null;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: filtermodel/Filter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Filter(propertyIndexOrName, value) {
    this.propertyIndex = (typeof propertyIndexOrName == "number"? propertyIndexOrName: null);
    this.propertyName = (typeof propertyIndexOrName == "string"? propertyIndexOrName: null);
    this.value = value;
    this.title = null;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: filtermodel/converters/URLFilterConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function URLFilterConverter() { }

URLFilterConverter.prototype.filterModelsToURLFilter = function(filterModels) {
    var urlFilters = [];
    for (var i = 0; i < filterModels.length; i++) {
        if (filterModels[i].filter != null) {
            urlFilters.push(this.filterToURLFilter(filterModels[i].filter));
        }
    }
    
    return urlFilters.join(":::");
}

URLFilterConverter.prototype.filterToURLFilter = function(filter) {
    return filter.propertyName + "::EQ::" + filter.value;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/CenterScale.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function CenterScale(centerX, centerY, scale) {
    this.coordPixFactor = 0.000352778;
    
    this.centerX = centerX;
    this.centerY = centerY;
    this.scale = scale;
}

CenterScale.prototype.equals = function(centerScale) {
    if (centerScale == null) {
        return false;
    }
    if ((this.centerX == centerScale.centerX) && (this.centerY == centerScale.centerY) &&
        (this.scale == centerScale.scale)
    ) {
        return true;
    }
    return false;
}

CenterScale.prototype.clone = function() {
    return new CenterScale(this.centerX, this.centerY, this.scale);
}

CenterScale.prototype.subtract = function(centerScale) {
    return new CenterScale(this.centerX - centerScale.centerX, this.centerY - centerScale.centerY, this.scale - centerScale.scale);
}

CenterScale.prototype.toEnvelope = function(width, height) {
    var numHorzCoords = width * this.coordPixFactor * this.scale;
    var numVertCoords = height * this.coordPixFactor * this.scale;
    var minX = this.centerX - numHorzCoords / 2;
    var minY = this.centerY - numVertCoords / 2;
    var maxX = minX + numHorzCoords;
    var maxY = minY + numVertCoords;
    return new Envelope(minX, minY, maxX, maxY);
}

CenterScale.prototype.toOffset = function(pixXOffset, pixYOffset) {
    var a = this.coordPixFactor * this.scale;
    return new CenterScale(this.centerX + pixXOffset * a, this.centerY - pixYOffset * a, this.scale);
}

CenterScale.prototype.fromOffset = function(pixXOffset, pixYOffset) {
    var a = this.coordPixFactor * this.scale;
    return new CenterScale(this.centerX - pixXOffset * a, this.centerY + pixYOffset * a, this.scale);
}

CenterScale.prototype.getNumWorldCoords = function(numPixs) {
    return numPixs * this.coordPixFactor * this.scale;
}

CenterScale.prototype.getWorldX = function(width, pixX) {
    pixX = pixX - (width / 2);
    var worldX = this.centerX + (pixX * this.coordPixFactor * this.scale);
    return worldX;
}

CenterScale.prototype.getWorldY = function(height, pixY) {
    pixY = pixY - (height / 2);
    var worldY = this.centerY - (pixY * this.coordPixFactor * this.scale);
    return worldY;
}

CenterScale.prototype.getNumPixs = function(numWorldCoords) {
    return numWorldCoords / this.coordPixFactor / this.scale;
}

CenterScale.prototype.getPixX = function(width, worldX) {
    var pixX = (worldX - this.centerX) / (this.coordPixFactor * this.scale);
    pixX = pixX + (width / 2);
    return pixX;
}

CenterScale.prototype.getPixY = function(height, worldY) {
    var pixY = (0 - worldY + this.centerY) / (this.coordPixFactor * this.scale);
    pixY = pixY + (height / 2);
    return pixY;
}

CenterScale.prototype.toString = function() {
    return "CenterScale(" + this.centerX + ", " + this.centerY + ", " + this.scale + ")";
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/FocusModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function FocusModel() {
    this.animationTimer = new AnimationTimer(1000);
    this.incubationTimer = new Timer(1000, 1);
    this.srs = new SRS();
    this.maxEnvelope = new Envelope(this.srs.minX, this.srs.minY, this.srs.maxX, this.srs.maxY);
    this.minScale = 846.37503189876580;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animation = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        var progress = focusModel.animationTimer.currentCount / focusModel.animationTimer.duration;
        
        if (progress < 1) {
            var base = focusModel.animation.base;
            var delta = focusModel.animation.target.subtract(base);

            focusModel.animationCenterScale = new CenterScale(
                base.centerX + (-delta.centerX * progress * progress + 2 * delta.centerX * progress),
                base.centerY + (-delta.centerY * progress * progress + 2 * delta.centerY * progress),
                base.scale + (-delta.scale * progress * progress + 2 * delta.scale * progress)
            ).fromOffset(focusModel.animation.pixXOffset, focusModel.animation.pixYOffset);
        } else {
            focusModel.animationCenterScale = focusModel.centerScale;
        }
    };
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = focusModel.centerScale;
    };
}

FocusModel.ALWAYS_LOWER = 0;
FocusModel.ALWAYS_NEAREST = 1;
FocusModel.ALWAYS_UPPER = 2;
FocusModel.IF_REQUIRED_LOWER = 3;
FocusModel.IF_REQUIRED_NEAREST = 4;
FocusModel.IF_REQUIRED_UPPER = 5;
FocusModel.IF_REQUIRED = 6;
FocusModel.NEVER = 7;

// Click or touch while zooming/panning.
FocusModel.prototype.grab = function(x, y, pixXOffset, pixYOffset) {
    var grabbedAnimation = false;
    
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScale.scale == this.centerScale.scale) {
            this.animationTimer.reset();
            this.centerScale = this.animationCenterScale;
        } else {
            this.centerScale = this.centercon(new CenterScale(x, y, this.centerScale.scale).fromOffset(pixXOffset, pixYOffset));
            this.animation = {
                base: new CenterScale(x, y, this.animation.base.scale),
                target: this.centerScale.toOffset(pixXOffset, pixYOffset),
                pixXOffset: pixXOffset,
                pixYOffset: pixYOffset
            };
        }
        this.setIncubationCenterScale();
        
        grabbedAnimation = true;
    }
    
    if (!this.animationTimer.isRunning()) {
        this.animation = {
            base: new CenterScale(x, y, this.centerScale.scale),
            target: this.centerScale.toOffset(pixXOffset, pixYOffset),
            pixXOffset: pixXOffset,
            pixYOffset: pixYOffset
        };
    }
    
    return grabbedAnimation;
}

// Pan with mouse move or one-finger touch.
FocusModel.prototype.pan = function(pixXOffset, pixYOffset) {
    this.animation.pixXOffset = pixXOffset;
    this.animation.pixYOffset = pixYOffset;
}

// Pan/zoom with multi-finger touch.
FocusModel.prototype.pinchPan = function(centerScale, pixXOffset, pixYOffset) {
    centerScale = this.scalecon(centerScale, FocusModel.NEVER);
    if (this.animationTimer.isRunning()) {
        this.animationTimer.reset();
    }
    
    this.animation = {
        base: centerScale,
        target: centerScale,
        pixXOffset: pixXOffset,
        pixYOffset: pixYOffset
    };
}

FocusModel.prototype.panimate = function() {
    if (!this.animationTimer.isRunning()) {
        var centerScale = this.centercon(this.animation.target.fromOffset(this.animation.pixXOffset, this.animation.pixYOffset));
        if (!this.centerScale.equals(centerScale)) {
            this.centerScale = this.animationCenterScale = centerScale;
            this.setIncubationCenterScale();
        }
    }
}

// Zoom with mouse wheel.
FocusModel.prototype.zoom = function(centerScale, pixXOffset, pixYOffset) {
    centerScale = this.scalecon(centerScale, FocusModel.IF_REQUIRED);
    if (this.animationCenterScale.scale == centerScale.scale) {
        return;
    }
    
    this.centerScale = this.centercon(centerScale.fromOffset(pixXOffset, pixYOffset));
    this.animation = {
        base: new CenterScale(centerScale.centerX, centerScale.centerY, this.animationCenterScale.scale),
        target: this.centerScale.toOffset(pixXOffset, pixYOffset),
        pixXOffset: pixXOffset,
        pixYOffset: pixYOffset
    };
    this.setAnimationCenterScale();
    this.setIncubationCenterScale();
}

FocusModel.prototype.setCenterScale = function(centerScale, zoomLevelPolicy) {
    if (centerScale == null) {
        return;
    }
    if (zoomLevelPolicy == null) {
        zoomLevelPolicy = FocusModel.IF_REQUIRED;
    }
    
    centerScale = this.centercon(this.scalecon(centerScale, zoomLevelPolicy));
    if (this.centerScale == null) {
        this.centerScale = centerScale;
        this.animation = {base: centerScale, target: centerScale, pixXOffset: 0, pixYOffset: 0};
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.animation = {base: this.animationCenterScale, target: centerScale, pixXOffset: 0, pixYOffset: 0};
    this.setAnimationCenterScale();
    this.setIncubationCenterScale();
}

FocusModel.prototype.setAnimationCenterScale = function() {
    this.animationTimer.reset();
    this.animationTimer.start();
}

FocusModel.prototype.setIncubationCenterScale = function() {
    this.incubationTimer.reset();
    this.incubationTimer.start();
}

// Center-related conditions. Relevant for zooming and panning.
FocusModel.prototype.centercon = function(centerScale) {
    if (
        (centerScale.centerX < this.maxEnvelope.minX) ||
        (centerScale.centerY < this.maxEnvelope.minY) ||
        (centerScale.centerX > this.maxEnvelope.maxX) ||
        (centerScale.centerY > this.maxEnvelope.maxY)
    ) {
        var centerX = Math.min(Math.max(centerScale.centerX, this.maxEnvelope.minX), this.maxEnvelope.maxX);
        var centerY = Math.min(Math.max(centerScale.centerY, this.maxEnvelope.minY), this.maxEnvelope.maxY);
        return new CenterScale(centerX, centerY, centerScale.scale);
    }
    
    return centerScale;
}

// Scale-related conditions. Relevant for zooming only.
FocusModel.prototype.scalecon = function(centerScale, zoomLevelPolicy) {
    if (centerScale.scale < this.minScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale), zoomLevelPolicy);
    }
    if (centerScale.scale > this.maxScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale), zoomLevelPolicy);
    }
    if (
        ((zoomLevelPolicy >= FocusModel.ALWAYS_LOWER) && (zoomLevelPolicy <= FocusModel.ALWAYS_UPPER)) ||
        ((zoomLevelPolicy >= FocusModel.IF_REQUIRED_LOWER) && (zoomLevelPolicy <= FocusModel.IF_REQUIRED) && this.scaleToZoomLevels)
    ) {
        if (zoomLevelPolicy == FocusModel.IF_REQUIRED) {
            zoomLevelPolicy = undefined;
        } else {
            zoomLevelPolicy = zoomLevelPolicy % 3;
        }
        var zoomLevelScale = this.srs.getZoomLevel(centerScale.scale, zoomLevelPolicy).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    
    return centerScale;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/EnvelopeModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function EnvelopeModel(boundsModel, focusModel) {
    this.boundsModel = boundsModel;
    this.focusModel = focusModel;
    
    this.bounds = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    
    this.envelope = null;
    this.animationEnvelope = null;
}

EnvelopeModel.prototype.getEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var centerScale = this.focusModel.centerScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
    }
    if (this.centerScale != centerScale) {
        this.centerScale = centerScale;
        this.envelope = null;
    }
    
    if ((this.envelope == null) && (bounds != null) && (centerScale != null)) {
        this.envelope = centerScale.toEnvelope(bounds.width, bounds.height);
    }
    
    return this.envelope;
}

EnvelopeModel.prototype.getAnimationEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var animationCenterScale = this.focusModel.animationCenterScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
    }
    if (this.animationCenterScale != animationCenterScale) {
        this.animationCenterScale = animationCenterScale;
        this.animationEnvelope = null;
    }
    
    if ((this.animationEnvelope == null) && (bounds != null) && (animationCenterScale != null)) {
        this.animationEnvelope = animationCenterScale.toEnvelope(bounds.width, bounds.height);
    }
    
    return this.animationEnvelope;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/ZoomLevel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function ZoomLevel(zoomLevel, scale, resolution) {
    this.zoomLevel = zoomLevel;
    this.scale = scale;
    this.resolution = resolution;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/SRS.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function SRS() {
    this.srid = 900913;
    this.zoomLevels = [
        new ZoomLevel(0, 443744272.72414012, 156543.0339),
        new ZoomLevel(1, 221872136.36207006, 78271.51695),
        new ZoomLevel(2, 110936068.18103503, 39135.758475),
        new ZoomLevel(3, 55468034.090517517, 19567.8792375),
        new ZoomLevel(4, 27734017.045258758, 9783.93961875),
        new ZoomLevel(5, 13867008.522629379, 4891.969809375),
        new ZoomLevel(6, 6933504.261314690, 2445.9849046875),
        new ZoomLevel(7, 3466752.130657345, 1222.99245234375),
        new ZoomLevel(8, 1733376.065328672, 611.496226171875),
        new ZoomLevel(9, 866688.0326643360, 305.7481130859375),
        new ZoomLevel(10, 433344.01633216810, 152.87405654296876),
        new ZoomLevel(11, 216672.00816608404, 76.43702827148438),
        new ZoomLevel(12, 108336.00408304202, 38.21851413574219),
        new ZoomLevel(13, 54168.002041521010, 19.109257067871095),
        new ZoomLevel(14, 27084.001020760505, 9.554628533935547),
        new ZoomLevel(15, 13542.000510380252, 4.777314266967774),
        new ZoomLevel(16, 6771.0002551901260, 2.388657133483887),
        new ZoomLevel(17, 3385.5001275950630, 1.1943285667419434),
        new ZoomLevel(18, 1692.7500637975315, 0.5971642833709717),
        new ZoomLevel(19, 846.37503189876580, 0.2985821416854859),
        new ZoomLevel(20, 423.18751594938290, 0.1492910708427429)
    ];
    this.minX = -20037508.3427892;
    this.minY = -20037508.3427892;
    this.maxX = 20037508.3427892;
    this.maxY = 20037508.3427892;
}

SRS.LOWER = 0;
SRS.NEAREST = 1;
SRS.UPPER = 2;

SRS.prototype.getZoomLevel = function(scale, policy) {
    if (policy == null) {
        policy = SRS.NEAREST;
    }
    
    if (policy == SRS.LOWER) {
        for (var i = 0; i < this.zoomLevels.length - 1; i++) {
            if (scale >= this.zoomLevels[i].scale) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[this.zoomLevels.length - 1];
    } else if (policy == SRS.NEAREST) {
        for (var i = 0; i < this.zoomLevels.length - 1; i++) {
            if (scale >= (this.zoomLevels[i].scale + this.zoomLevels[i + 1].scale) / 2) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[this.zoomLevels.length - 1];
    } else {  // policy == SRS.UPPER
        for (var i = this.zoomLevels.length - 1; i > 0; i--) {
            if (scale <= this.zoomLevels[i].scale) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[0];
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: mapcontroller/MapController.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function MapController(element, env, scope) {
    var mouseWheelTime = performance.now();
    var mouseWheelDelta = -1;
    
    var panTimer = new PanSpeedTimer();  // Role of timer is 2-fold: measure pan speed, but also apply digest cycle every tick.
    panTimer.scope = scope;
    panTimer.timerHandler = function() { env.focusModel.panimate(); };
    
    element.addEventListener("wheel", mouseWheelHandler);
    element.addEventListener("mousedown", pressHandler);
    element.addEventListener("touchstart", pressHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    
    this.destroy = function() {
        document.removeEventListener("mousemove", mouseMoveHandler);
    }
    
    function mouseWheelHandler(mouseEvent) {
        mouseEvent.preventDefault();
        
        var delta = mouseEvent.deltaY;
        if (delta == 0) {
            return;
        }
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var cs = env.focusModel.centerScale;
        var acs = env.focusModel.animationCenterScale;
        
        if (env.mouseWheelAction == "HORIZONTAL_PAN") {
            if (delta > 0) {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX - acs.getNumWorldCoords(width / 2),
                    cs.centerY,
                    cs.scale
                ));
            } else {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX + acs.getNumWorldCoords(width / 2),
                    cs.centerY,
                    cs.scale
                ));
            }
        } else if (env.mouseWheelAction == "VERTICAL_PAN") {
            if (delta > 0) {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX,
                    cs.centerY + acs.getNumWorldCoords(height / 2),
                    cs.scale
                ));
            } else {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX,
                    cs.centerY - acs.getNumWorldCoords(height / 2),
                    cs.scale
                ));
            }
        } else {  // ZOOM
            var now = performance.now();
            var reverseZoom = (mouseWheelDelta * delta < 0);
            if (!env.focusModel.scaleToZoomLevels || (mouseWheelTime < now - 250) || reverseZoom) {
                mouseWheelTime = now;
                mouseWheelDelta = delta;
                
                var zoomFactor = env.focusModel.scaleToZoomLevels? 2: 1.3;
                if (delta < 0) {
                    zoomFactor = 1 / zoomFactor;
                }
                
                var mouseX = mouseEvent.clientX - element.getBoundingClientRect().left;
                var mouseY = mouseEvent.clientY - element.getBoundingClientRect().top;
                
                var worldX = acs.getWorldX(width, mouseX);
                var worldY = acs.getWorldY(height, mouseY);
                var scale = (reverseZoom? acs.scale: cs.scale) * zoomFactor;
                
                var pixXOffset = mouseX - (width / 2);
                var pixYOffset = mouseY - (height / 2);
                
                env.focusModel.zoom(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
            }
        }
    }
    
    function pressHandler(event) {
        if (panTimer.isRunning()) {  // From 1 to 2 fingers is not a true press anymore.
            return;
        }
        
        event.preventDefault();
        decorateTouchEvent(event, false);
        
        var pressX = event.clientX - element.getBoundingClientRect().left;
        var pressY = event.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var cs = env.focusModel.animationCenterScale;
        var worldX = cs.getWorldX(width, pressX);
        var worldY = cs.getWorldY(height, pressY);
        
        var pixXOffset = pressX - (width / 2);
        var pixYOffset = pressY - (height / 2);
        
        var grabbedAnimation = env.focusModel.grab(worldX, worldY, pixXOffset, pixYOffset);
        
        panTimer.start(event);
        panTimer.panned = grabbedAnimation;
        
        if (event.type == "mousedown") {
            document.addEventListener("mouseup", releaseHandler);
        } else {  // touchstart
            document.addEventListener("touchmove", touchMoveHandler);
            document.addEventListener("touchend", releaseHandler);
            document.addEventListener("touchcancel", releaseHandler);
        }
        
        if (env.pressFunction != null) {
            if (scope != null) {
                scope.$apply(env.pressFunction(worldX, worldY));
            } else {
                env.pressFunction(worldX, worldY);
            }
        }
    }
    
    function mouseMoveHandler(mouseEvent) {
        if (!panTimer.isRunning() && (env.mouseMoveFunction == null)) {
            return;
        }
        
        mouseEvent.preventDefault();
        
        var mouseX = mouseEvent.clientX - element.getBoundingClientRect().left;
        var mouseY = mouseEvent.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        if (panTimer.isRunning()) {
            var previousEvent = panTimer.panEvents[panTimer.panEvents.length - 1];
            if ((previousEvent.clientX != mouseEvent.clientX) || (previousEvent.clientY != mouseEvent.clientY)) {
                var pixXOffset = mouseX - (width / 2);
                var pixYOffset = mouseY - (height / 2);
                
                env.focusModel.pan(pixXOffset, pixYOffset);
                
                panTimer.push(mouseEvent);
            }
        } else {  // (env.mouseMoveFunction != null)
            var cs = env.focusModel.animationCenterScale;
            var worldX = cs.getWorldX(width, mouseX);
            var worldY = cs.getWorldY(height, mouseY);
            
            if (scope != null) {
                scope.$apply(env.mouseMoveFunction(worldX, worldY));
            } else {
                env.mouseMoveFunction(worldX, worldY);
            }
        }
    }
    
    function touchMoveHandler(touchEvent) {
        touchEvent.preventDefault();
        decorateTouchEvent(touchEvent, false);
        
        var pinchX = touchEvent.clientX - element.getBoundingClientRect().left;
        var pinchY = touchEvent.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var pixXOffset = pinchX - (width / 2);
        var pixYOffset = pinchY - (height / 2);
        
        var previousEvent = panTimer.panEvents[panTimer.panEvents.length - 1];
        if ((touchEvent.touches.length == 1) && (previousEvent.touches.length == 1)) {
            env.focusModel.pan(pixXOffset, pixYOffset);
        } else {
            var cs = env.focusModel.animationCenterScale;
            var worldX = -1;
            var worldY = -1;
            var scale = cs.scale;
            
            if (touchEvent.touches.length != previousEvent.touches.length) {
                worldX = cs.getWorldX(width, pinchX);
                worldY = cs.getWorldY(height, pinchY);
            } else {
                worldX = env.focusModel.animation.target.centerX;
                worldY = env.focusModel.animation.target.centerY;
                scale = env.focusModel.animation.target.scale / (touchEvent.radius / previousEvent.radius);
            }
            
            env.focusModel.pinchPan(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
        }
        
        panTimer.push(touchEvent);
    }
    
    function releaseHandler(event) {
        if ((event.touches != null) && (event.touches.length > 0)) {  // From 2 to 1 fingers is not a true release yet.
            return;
        }
        
        decorateTouchEvent(event, false);
        
        var cs = env.focusModel.animationCenterScale;
        
        var tapped = (!panTimer.panned)? panTimer.currentCount: false;
        var speed = panTimer.resetAndGetSpeed(event);
        if ((speed.h != 0) || (speed.v != 0) || (speed.z != 1)) {
            var zoomLevelPolicy = FocusModel.NEVER;  // On touch devices, don't do the zoom level check.
            if (event.type == "mouseup") {
                zoomLevelPolicy = FocusModel.IF_REQUIRED;
            }
            env.focusModel.setCenterScale(new CenterScale(
                cs.centerX - cs.getNumWorldCoords(speed.h) * 250,  // 250 = 1000 / 4 = animationDuration / deceleration
                cs.centerY + cs.getNumWorldCoords(speed.v) * 250,
                cs.scale / Math.pow(speed.z, 250)
            ), zoomLevelPolicy);
        }
        
        if (event.type == "mouseup") {
            document.removeEventListener("mouseup", releaseHandler);
        } else {  // touchend || touchcancel
            document.removeEventListener("touchmove", touchMoveHandler);
            document.removeEventListener("touchend", releaseHandler);
            document.removeEventListener("touchcancel", releaseHandler);
            
            // Stop emulated mouse event. Calling touchEvent.preventDefault() does not prevent mouse emulation in iOS.
            element.removeEventListener("mousedown", pressHandler);
            setTimeout(function() { element.removeEventListener("mousedown", pressHandler); element.addEventListener("mousedown", pressHandler); }, 1000);
        }
        
        if ((env.releaseFunction != null) || ((env.tapFunction != null) && tapped)) {
            var releaseX = event.clientX - element.getBoundingClientRect().left;
            var releaseY = event.clientY - element.getBoundingClientRect().top;
            
            var width = env.boundsModel.bounds.width;
            var height = env.boundsModel.bounds.height;
            
            var worldX = cs.getWorldX(width, releaseX);
            var worldY = cs.getWorldY(height, releaseY);
            
            if (env.releaseFunction != null) {
                if (scope != null) {
                    scope.$apply(env.releaseFunction(worldX, worldY));
                } else {
                    env.releaseFunction(worldX, worldY);
                }
            }
            if ((env.tapFunction != null) && tapped) {  // tapped contains the tap duration.
                if (scope != null) {
                    scope.$apply(env.tapFunction(worldX, worldY, tapped, event.ctrlKey, event.shiftKey));
                } else {
                    env.tapFunction(worldX, worldY, tapped, event.ctrlKey, event.shiftKey);
                }
            }
        }
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/Layer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Layer(name) {
    this.name = name;
    this.baseURL = "https://tile.openstreetmap.org/";
    this.styleURL = null;
    this.urlExtension = "$Z/$X/$Y.png";
    this.format = "image/png";
    this.visible = true;
    this.title = name;
    this.filterModels = [];
    this.classification = null;
    this.vendorSpecifics = {};
}

Layer.prototype.forceReload = function() {
    this.vendorSpecifics.epochtime = performance.now();
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/Loader.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Loader() {
    this.layers = {};
    this.numLoading = 0;
}

Loader.prototype.add = function(key) {
    if (this.layers[key] == null) {
        this.layers[key] = 0;
    }
    this.layers[key]++;
    this.setNumLoading();
}

Loader.prototype.subtract = function(key) {
    this.layers[key]--;
    this.setNumLoading();
}

Loader.prototype.set = function(key) {
    this.layers[key] = 1;
    this.setNumLoading();
}

Loader.prototype.reset = function(key) {
    this.layers[key] = 0;
    this.setNumLoading();
}

Loader.prototype.remove = function(key) {
    delete this.layers[key];
    this.setNumLoading();
}

Loader.prototype.setNumLoading = function() {
    this.numLoading = 0;
    for (var key in this.layers) {
        this.numLoading += this.layers[key];
    }
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/Tile.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function Tile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
    this.minX = minX;
    this.maxY = maxY;
    this.scale = scale;
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.url = url;
    this.x = 0;
    this.y = 0;
    this.scaling = 1;
    this.completed = false;
    this.corrupted = false;
}

Tile.prototype.reset = function(bounds, centerScale) {
    this.x = centerScale.getPixX(bounds.width, this.minX);
    this.y = centerScale.getPixY(bounds.height, this.maxY);
    this.scaling = this.scale / centerScale.scale;
}

Tile.prototype.resetWithPoint = function(bounds, centerScale, minX, maxY) {
    this.x = centerScale.getPixX(bounds.width, minX);
    this.y = centerScale.getPixY(bounds.height, maxY);
    this.scaling = this.scale / centerScale.scale;
}

Tile.prototype.resetWithEnvelope = function(bounds, centerScale, envelope) {
    var minPixX = centerScale.getPixX(bounds.width, envelope.minX);
    var minPixY = centerScale.getPixY(bounds.height, envelope.maxY);
    var maxPixX = centerScale.getPixX(bounds.width, envelope.maxX);
    //var maxPixY = centerScale.getPixY(bounds.height, envelope.minY);
    
    this.x = minPixX;
    this.y = minPixY;
    this.scaling = (maxPixX - minPixX) / this.tileWidth;
    //var vertScaling = (maxPixY - minPixY) / this.tileHeight;
}

Tile.prototype.toCSS = function() {
    return {left: this.x + "px", top: this.y + "px", width: (this.tileWidth * this.scaling) + "px", height: (this.tileHeight * this.scaling) + "px"};
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/TileModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function TileModel() {
    this.bounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.envelope = null;
    this.animationEnvelope = null;
    this.layer = null;
    this.loader = null;
    this.protocol = "TMS";
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
    this.http = null;  // Used only for UTFGrid tile models.
}

TileModel.prototype.setBounds = function(bounds, envelope, animationEnvelope) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.envelope = envelope;
    this.animationEnvelope = animationEnvelope;
    this.loadTiles();
    this.resetTiles();
}

TileModel.prototype.setCenterScale = function(centerScale, envelope) {
    this.centerScale = centerScale;
    this.envelope = envelope;
    this.loadTiles();
}

TileModel.prototype.setAnimationCenterScale = function(animationCenterScale, animationEnvelope) {
    this.animationCenterScale = animationCenterScale;
    this.animationEnvelope = animationEnvelope;
    this.resetTiles();
}

TileModel.prototype.setLayer = function(layer) {
    if ((this.loader != null) && (this.layer != null)) {
        this.loader.remove(this.layer.name);
    }
    if ((this.loader != null) && (layer != null)) {
        this.loader.reset(layer.name);
    }
    this.layer = layer;
    this.tiles = [];
    this.tileIndex = {};
    this.loadTiles();
    this.resetTiles();
}

TileModel.prototype.loadTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.envelope;
    if (envelope == null) {
        envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    }
    var zoomLevel = this.srs.getZoomLevel(this.centerScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.srs.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.srs.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if ((tile == null) || (tile.corrupted && (tile.corrupted + 7000 < performance.now()))) {
                if (tile == null) {
                    var minX = tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                    var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                    
                    var url = null;
                    if (this.protocol == "TMS") {
                        url = this.layer.urlExtension;
                        url = url.replace("$Z", zoomLevel.zoomLevel);
                        url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                        url = url.replace("$Y", tileY);
                        url = this.layer.baseURL + url;
                    } else {  // WMTS
                        var maxX = (tileX + 1) * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                        var minY = -((tileY + 1) * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                        url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, this.tileWidth, this.tileHeight, true);
                    }
                    
                    tile = new Tile(minX, maxY, zoomLevel.scale, tileX, tileY, this.tileWidth, this.tileHeight, url);
                    this.addTile(zoomLevel.zoomLevel, tile);
                } else {
                    tile.completed = false;
                    tile.corrupted = false;
                }
                
                if (this.loader != null) {
                    this.loader.add(this.layer.name);
                }
                
                if (this.ctx != null) {
                    var f = function(t, env, success) { return function() { env.completeTile(t, success); }};
                    
                    tile.data = new Image();
                    tile.data.addEventListener("load", f(tile, this, true));
                    tile.data.addEventListener("error", f(tile, this, false));
                    tile.data.src = tile.url;
                }
                
                if (this.http != null) {
                    var f = function(t) {
                        return function(data, status, headers, config) {
                            t.utfGrid = eval(data);
                        }
                    }(tile);
                    this.http({ method: "GET", url: tile.url, cache: true }).success(f);
                }
            }
        }
    }
}

TileModel.prototype.resetTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    } else {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].completed = false;
        }
    }
    
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.animationEnvelope;
    if (envelope == null) {
        envelope = this.animationCenterScale.toEnvelope(this.bounds.width, this.bounds.height);
    }
    var zoomLevel = this.srs.getZoomLevel(this.animationCenterScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.srs.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.srs.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if (this.ctx != null) {
                if ((tile != null) && tile.completed && !tile.corrupted) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    this.drawTile(tile, true);
                } else {
                    var minX = tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                    var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                    this.drawTilesAroundZoomLevel(zoomLevel.zoomLevel, minX, maxY);
                }
            } else {
                if (tile != null) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    tile.completed = true;
                }
            }
        }
    }
}

TileModel.prototype.addTile = function(zoomLevel, tile) {
    if (this.tileIndex[zoomLevel] == null) {
        this.tileIndex[zoomLevel] = {};
    }
    if (this.tileIndex[zoomLevel][tile.tileX] == null) {
        this.tileIndex[zoomLevel][tile.tileX] = {};
    }
    this.tileIndex[zoomLevel][tile.tileX][tile.tileY] = this.tiles.push(tile) - 1;
}

TileModel.prototype.getTile = function(zoomLevel, tileX, tileY) {
    if ((this.tileIndex[zoomLevel] == null) || (this.tileIndex[zoomLevel][tileX] == null) || (this.tileIndex[zoomLevel][tileX][tileY] == null)) {
        return null;
    }
    
    return this.tiles[this.tileIndex[zoomLevel][tileX][tileY]];
}

TileModel.prototype.completeTile = function(tile, success) {
    var zoomLevel = this.srs.getZoomLevel(tile.scale);
    if (this.getTile(zoomLevel.zoomLevel, tile.tileX, tile.tileY) != tile) {
        return;
    }
    
    if (this.loader != null) {
        this.loader.subtract(this.layer.name);
    }
    tile.completed = true;
    
    if (success) {
        tile.corrupted = false;
        
        if ((this.animationCenterScale != null) && (this.srs.getZoomLevel(this.animationCenterScale.scale) == zoomLevel)) {
            tile.reset(this.bounds, this.animationCenterScale);
            if (this.ctx != null) {
                this.drawTile(tile, true);
            }
        }
    } else {
        tile.corrupted = performance.now();
        
        console.log("Error loading tile: " + tile.url);
    }
}

TileModel.prototype.drawTilesAroundZoomLevel = function(zl, minX, maxY) {
    // Find any completed tile in the zoom levels above the given zoom level.
    for (var i = zl - 1; i >= 0; i--) {
        var zoomLevel = this.srs.zoomLevels[i];
        var zoomFactor = Math.pow(2, zl - i);
        var subTileX = Math.round((minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth * zoomFactor) / zoomFactor;
        var tileX = Math.floor(subTileX);
        var subTileY = Math.round((this.srs.maxY - maxY) / zoomLevel.resolution / this.tileHeight * zoomFactor) / zoomFactor;
        var tileY = Math.max(Math.floor(subTileY), 0);
        var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
        if ((tile != null) && tile.completed && !tile.corrupted) {
            tile.resetWithPoint(this.bounds, this.animationCenterScale, minX, maxY);
            this.ctx.drawImage(
                tile.data,
                (subTileX % 1) * this.tileWidth, (subTileY % 1) * this.tileHeight,
                this.tileWidth / zoomFactor, this.tileHeight / zoomFactor,
                Math.round(tile.x), Math.round(tile.y),
                Math.ceil(tile.scaling * this.tileWidth / zoomFactor), Math.ceil(tile.scaling * this.tileHeight / zoomFactor)
            );
            break;
        }
    }

    // Find completed tiles in the (single one) zoom level below the given zoom level.
    if (zl == this.srs.zoomLevels.length - 1) {
        return;
    }
    var zoomLevel = this.srs.zoomLevels[zl + 1];
    var leftTileX = Math.round((minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.round((this.srs.maxY - maxY) / zoomLevel.resolution / this.tileHeight), 0);
    for (var tileY = topTileY; tileY <= topTileY + 1; tileY++) {
        for (var tileX = leftTileX; tileX <= leftTileX + 1; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            if ((tile != null) && tile.completed && !tile.corrupted) {
                tile.reset(this.bounds, this.animationCenterScale);
                this.drawTile(tile, false);
            }
        }
    }
}

TileModel.prototype.drawTile = function(tile, clear) {
    var x = Math.round(tile.x);
    var y = Math.round(tile.y);
    var width = Math.round(tile.x + tile.scaling * this.tileWidth) - x;
    var height = Math.round(tile.y + tile.scaling * this.tileHeight) - y;
    if (clear) {
        this.ctx.clearRect(x, y, width, height);
    }
    this.ctx.drawImage(tile.data, x, y, width, height);
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/UTFGridModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function UTFGridModel() {
    this.bounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.envelope = null;
    this.animationEnvelope = null;
    this.layer = null;
    this.loader = null;
    this.protocol = "UTFGrid";
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Not used for UTFGrid tile models.
    this.http = null;
    
    this.resolution = 4;
}

UTFGridModel.prototype = new TileModel();
UTFGridModel.prototype.constructor = UTFGridModel;

UTFGridModel.prototype.getFeature = function(pixX, pixY) {
    var zoomLevel = this.srs.getZoomLevel(this.animationCenterScale.scale);
    var worldX = this.animationCenterScale.getWorldX(this.bounds.width, pixX);
    var worldY = this.animationCenterScale.getWorldY(this.bounds.height, pixY);
    var tileX = Math.floor((worldX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var tileY = Math.max(Math.floor((this.srs.maxY - worldY) / zoomLevel.resolution / this.tileHeight), 0);
    var tile = this.getTile(tileX, tileY, zoomLevel.scale);
    if (tile == null) {
        return null;
    }
    
    var utfGrid = tile.utfGrid;
    if (utfGrid == null) {
        return null;
    }
    
    var xInTile = Math.floor((pixX - tile.x) / tile.scaling / this.resolution);
    var yInTile = Math.floor((pixY - tile.y) / tile.scaling / this.resolution);
    if (utfGrid.grid[yInTile] == null) {
        return null;
    }
    
    var index = this.getIndex(utfGrid.grid[yInTile].charCodeAt(xInTile));
    var key = utfGrid.keys[index];
    if (!utfGrid.data.hasOwnProperty(key)) {
        return null;
    }
    
    return utfGrid.data[key];
}

UTFGridModel.prototype.getIndex = function(utfCode) {
    if (utfCode >= 93) {
        utfCode--;
    }
    if (utfCode >= 35) {
        utfCode--;
    }
    return utfCode - 32;
}

function grid(utfGridString) {
    return utfGridString;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/WMSModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function WMSModel() {
    this.bounds = null;
    this.incubationBounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.layer = null;
    this.loader = null;
    this.autoClassification = true;
    this.tile = null;
    this.previousTile = null;
    this.ctx = null;
}

WMSModel.prototype.setBounds = function(bounds) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.resetTiles();
}

WMSModel.prototype.setIncubationBounds = function(incubationBounds) {
    this.incubationBounds = incubationBounds;
    this.load();
}

WMSModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.load();
}

WMSModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationCenterScale = animationCenterScale;
    this.resetTiles();
}

WMSModel.prototype.setLayer = function(layer) {
    if ((this.loader != null) && (this.layer != null)) {
        this.loader.remove(this.layer.name);
    }
    if ((this.loader != null) && (layer != null)) {
        this.loader.reset(layer.name);
    }
    this.layer = layer;
    this.tile = null;
    this.previousTile = null;
    this.load();
}

WMSModel.prototype.load = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    if ((this.tile != null) && this.tile.completed && !this.tile.corrupted) {
        this.previousTile = this.tile;
    }
    this.tile = null;
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.minX;
    var minY = envelope.minY;
    var maxX = envelope.maxX;
    var maxY = envelope.maxY;
    
    if ((minX > this.srs.maxX) || (minY > this.srs.maxY) || (maxX < this.srs.minX) || (maxY < this.srs.minY)) {
        return;
    }
    
    minX = Math.max(minX, this.srs.minX);
    minY = Math.max(minY, this.srs.minY);
    maxX = Math.min(maxX, this.srs.maxX);
    maxY = Math.min(maxY, this.srs.maxY);
    
    var tileWidth = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var tileHeight = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
    var url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, tileWidth, tileHeight, this.autoClassification);
    
    if (this.loader != null) {
        this.loader.set(this.layer.name);
    }
    this.tile = new Tile(minX, maxY, this.centerScale.scale, 1, 1, tileWidth, tileHeight, url);
    
    if (this.animationCenterScale != null) {
        this.tile.reset(this.bounds, this.animationCenterScale);
        if (this.previousTile != null) {
            this.previousTile.reset(this.bounds, this.animationCenterScale);
        }
    }
    
    if (this.ctx != null) {
        if (this.previousTile != null) {
            this.drawTile(this.previousTile);
        }
        var f = function(t, env, success) { return function() { env.completeTile(t, success); }};
        this.tile.data = new Image();
        this.tile.data.addEventListener("load", f(this.tile, this, true));
        this.tile.data.addEventListener("error", f(this.tile, this, false));
        this.tile.data.src = this.tile.url;
    }
}

WMSModel.prototype.resetTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    if (this.tile != null) {
        this.tile.reset(this.bounds, this.animationCenterScale);
        if (this.previousTile != null) {
            this.previousTile.reset(this.bounds, this.animationCenterScale);
        }
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
        if (this.tile != null) {
            if (this.tile.completed && !this.tile.corrupted) {
                this.drawTile(this.tile);
            } else if (this.previousTile != null) {
                this.drawTile(this.previousTile);
            }
        }
    }
}

WMSModel.prototype.completeTile = function(tile, success) {
    if (this.tile != tile) {
        return;
    }
    
    if (this.loader != null) {
        this.loader.reset(this.layer.name);
    }
    tile.completed = true;
    
    if (success) {
        tile.corrupted = false;
        
        this.previousTile = null;
        
        if (this.animationCenterScale != null) {
            tile.reset(this.bounds, this.animationCenterScale);
            if (this.ctx != null) {
                this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
                this.drawTile(tile);
            }
        }
    } else {
        tile.corrupted = performance.now();
        
        console.log("Error loading WMS: " + tile.url);
    }
}

WMSModel.prototype.drawTile = function(tile) {
    this.ctx.drawImage(
        tile.data,
        Math.round(tile.x), Math.round(tile.y),
        Math.round(tile.scaling * tile.tileWidth), Math.round(tile.scaling * tile.tileHeight)
    );
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/MapFeatureModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


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



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/protocols/WMSProtocol.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function WMSProtocol() { }

WMSProtocol.getMapURL = function(layer, srs, minX, minY, maxX, maxY, tileWidth, tileHeight, autoClassification) {
    var url = layer.baseURL;
    url += (url.indexOf("?") == -1 ? "?" : "&") + "SERVICE=WMS";
    url += "&VERSION=1.1.1";
    url += "&REQUEST=GetMap";
    
    if (layer.styleURL == null) {
        url += "&LAYERS=" + layer.name;
        url += "&STYLES=";
    } else {
        var sldURL = layer.styleURL;
        if (layer.name != null) {
            sldURL += "?layer=" + layer.name;
        }
        var urlFilter = (new URLFilterConverter()).filterModelsToURLFilter(layer.filterModels);
        if (urlFilter.length > 0) {
            sldURL += "&filter=" + urlFilter;
        }
        if (layer.classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(layer.classification));
            if ((urlFilter.length == 0) || (!autoClassification)) {
                sldURL += "::noFilter";
            }
        }
        url += "&SLD=" + encodeURIComponent(sldURL);
    }
    url += "&TRANSPARENT=true";
    url += "&SRS=EPSG:" + srs.srid;
    url += "&BBOX=" + minX + "," + minY + "," + maxX + "," + maxY;
    url += "&WIDTH=" + tileWidth;
    url += "&HEIGHT=" + tileHeight;
    url += "&FORMAT=" + layer.format;
    url += "&EXCEPTIONS=application/vnd.ogc.se_xml";
    
    for (var key in layer.vendorSpecifics) {
        url += "&" + key + "=" + layer.vendorSpecifics[key];
    }
    
    return url;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: selectionmodel/SelectionModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function SelectionModel() {
    this.selectedFeatures = null;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: stylemodel/converters/URLClassificationConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


export function URLClassificationConverter() { }

URLClassificationConverter.classificationToURLClassification = function(classification) {
    var urlClassification = classification.propertyName + "::";
    
    if (classification.numClasses != null) {
        urlClassification += classification.numClasses + "::";
    } else if (classification.thresholds != null) {
        urlClassification += classification.thresholds.join(":") + "::";
    }
    
    if (classification.colors != null) {
        var colorString = null;
        for (var i = 0; i < classification.colors.length; i++) {
            colorString = classification.colors[i].toString(16).toUpperCase();
            while (colorString.length < 6) {
                colorString = "0" + colorString;
            }
            colorString = "#" + colorString;
            
            urlClassification += colorString;
            if (i < classification.colors.length - 1) {
                urlClassification += ":";
            }
            
            if (classification.numbers != null) {
                urlClassification += "::";
            }
        }
    }
    if (classification.numbers != null) {
        for (var j = 0; j < classification.numbers.length; j++) {
            urlClassification += classification.numbers[j];
            if (j < classification.numbers.length - 1) {
                urlClassification += ":";
            }
        }
    }
    
    return urlClassification;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: niney.es2015.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


const boundsModel = new BoundsModel();
boundsModel.setBounds(new Bounds(window.innerWidth, window.innerHeight));
window.addEventListener("resize", function(resizeEvent) {
    boundsModel.setBounds(new Bounds(window.innerWidth, window.innerHeight));
});

export const windowBoundsModel = boundsModel;
export const defaultBoundsModel = new BoundsModel();

export const defaultFocusModel = new FocusModel();
export const defaultEnvelopeModel = new EnvelopeModel(defaultBoundsModel, defaultFocusModel);

export const defaultTilesLayer = new Layer("Tiles");

