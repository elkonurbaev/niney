

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "mergejs.txt" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Tue May 22 00:27:00 CEST 2018  */

/* Merging order :

- utils.js
- geometrymodel/Geometry.js
- geometrymodel/GeometryCollection.js
- geometrymodel/Point.js
- geometrymodel/Envelope.js
- geometrymodel/GeometryTools.js
- geometrymodel/LineString.js
- geometrymodel/Polygon.js
- geometrymodel/converters/WKTConverter.js
- geometrymodel/converters/SVGConverter.js
- featuremodel/Feature.js
- featuremodel/FeatureModel.js
- featuremodel/FeatureType.js
- featuremodel/Property.js
- featuremodel/PropertyType.js
- featuremodel/commands/EmptyFeatureCommand.js
- featuremodel/commands/SelectFeatureCommand.js
- featuremodel/commands/ToggleSelectFeatureCommand.js
- featuremodel/commands/ToURLFeatureCommand.js
- featuremodel/converters/CSVConverter.js
- filtermodel/converters/URLFilterConverter.js
- focusmodel/CenterScale.js
- focusmodel/FocusModel.js
- focusmodel/EnvelopeCenterScale.js
- focusmodel/ZoomLevel.js
- layermodel/Layer.js
- layermodel/Tile.js
- layermodel/TileModel.js
- layermodel/UTFGridModel.js
- layermodel/WMSModel.js
- selectionmodel/SelectionModel.js
- service/file/CSVServiceConnector.js
- stylemodel/converters/URLClassificationConverter.js
- niney.angular.js

*/


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: utils.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function BoundsModel() {
    this.bounds = null;
}

BoundsModel.prototype.setBounds = function(bounds) {
    if (bounds.equals(this.bounds)) {
        return;
    }
    this.bounds = bounds;
}

function Bounds(width, height) {
    this.width = width;
    this.height = height;
}

Bounds.prototype.equals = function(o) {
    return ((o != null) && (this.width == o.width) && (this.height == o.height));
};

function Timer(delay, numRepeats) {
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

function AnimationTimer(duration) {
    this.delay = -1;
    this.numRepeats = -1;
    this.currentCount = 0;  // currentTime - startTime
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
        
        function preTick(currentTime) {
            timer.currentCount = currentTime - timer.startTime;
            if (timer.currentCount > timer.duration) {
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

function PanSpeedTimer(delay, numRepeats) {
    this.delay = delay;
    this.numRepeats = numRepeats;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    
    this.panEvent = null;
    this.lastPoint0 = null;
    this.lastPoint1 = null;
    this.lastPointWas0 = false;
    this.speed = {h: -1, v: -1};
    
    var panSpeedTimer = this;
    this.timerHandler = function() {
        if (!panSpeedTimer.lastPointWas0) {
            panSpeedTimer.lastPoint0 = {
                x: panSpeedTimer.panEvent.clientX,
                y: panSpeedTimer.panEvent.clientY,
                numTouches: (panSpeedTimer.panEvent.touches? panSpeedTimer.panEvent.touches.length: 1),
                time: (new Date()).getTime()
            };
            panSpeedTimer.lastPointWas0 = true;
        } else {
            panSpeedTimer.lastPoint1 = {
                x: panSpeedTimer.panEvent.clientX,
                y: panSpeedTimer.panEvent.clientY,
                numTouches: (panSpeedTimer.panEvent.touches? panSpeedTimer.panEvent.touches.length: 1),
                time: (new Date()).getTime()
            };
            panSpeedTimer.lastPointWas0 = false;
        }
    };
}

PanSpeedTimer.prototype = new Timer();
PanSpeedTimer.prototype.constructor = PanSpeedTimer;

PanSpeedTimer.prototype.start = function() {
    this.lastPoint0 = {
        x: this.panEvent.clientX,
        y: this.panEvent.clientY,
        numTouches: (this.panEvent.touches? this.panEvent.touches.length: 1),
        time: (new Date()).getTime()
    };
    this.lastPointWas0 = true;
    
    Timer.prototype.start.call(this);
}

PanSpeedTimer.prototype.resetAndGetSpeed = function() {
    if (this.lastPoint1 == null) {
        // timerHandler has not been called yet. Use the initial point, no other point is available.
    } else if (this.lastPointWas0) {
        // Then use point 1, else use point 0. Always use the oldest point available.
        this.lastPoint0 = this.lastPoint1;
    }
    
    if ((this.panEvent.touches == null) || (this.panEvent.touches.length == this.lastPoint0.numTouches)) {
        var timeSpan = (new Date()).getTime() - this.lastPoint0.time;
        this.speed.h = (this.panEvent.clientX - this.lastPoint0.x) / timeSpan;
        this.speed.v = (this.panEvent.clientY - this.lastPoint0.y) / timeSpan;
    } else {
        this.speed.h = 0;
        this.speed.v = 0;
    }
    
    this.lastPoint0 = null;
    this.lastPoint1 = null;
    this.lastPointWas0 = false;
    
    Timer.prototype.reset.call(this);
    
    return this.speed;
}

function decorateTouchEvent(touchEvent, lastTouchOnly) {
    if (touchEvent.touches == null) {  // Not a touch event.
        return;
    }
    
    var touch = touchEvent.touches[touchEvent.touches.length - 1];
    if ((touchEvent.touches.length == 1) || lastTouchOnly)  {
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



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/GeometryCollection.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function GeometryCollection(geometries) {
    this.$parent = null;
    this.childGeometries = new Array();
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
    var clonedGeometries = new Array();
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedGeometries.push(this.childGeometries[i].clone());
    }
    return new GeometryCollection(clonedGeometries);
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Point.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Point(x, y) {
    this.$parent = null;
    this.childGeometries = new Array();
    this.envelope = null;
    
    this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
Point.prototype.constructor = Point;

Point.prototype.addChild = function(child) { }

Point.prototype.removeChild = function(child) { }

Point.prototype.getPoints = function() {
    return new Array(this);
}

Point.prototype.getEndPoint = function() {
    return this;
}

Point.prototype.getCenterPoint = function() {
    return this.clone();
}

Point.prototype.getEnvelope = function() {
    return new Envelope(this.x, this.y, this.x, this.y);
}

Point.prototype.intersects = function(intersectingEnvelope) {
    return (
        (this.x >= intersectingEnvelope.getMinX()) &&
        (this.y >= intersectingEnvelope.getMinY()) &&
        (this.x <= intersectingEnvelope.getMaxX()) &&
        (this.y <= intersectingEnvelope.getMaxY())
    );
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
}

Point.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Envelope.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Envelope(minX, minY, maxX, maxY) {
    this.$parent = null;
    this.childGeometries = new Array();
    this.envelope = null;
    
    var point0 = new Point(minX, minY);
    var point1 = new Point(maxX, maxY);
    point0.setParent(this);
    point1.setParent(this);
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.getEnvelope = function() {
    return this.clone();
}

Envelope.prototype.intersects = function(intersectingEnvelope) {
    return (
        (this.getMinX() <= intersectingEnvelope.getMaxX()) &&
        (this.getMinY() <= intersectingEnvelope.getMaxY()) &&
        (this.getMaxX() >= intersectingEnvelope.getMinX()) &&
        (this.getMaxY() >= intersectingEnvelope.getMinY())
    );
}

Envelope.prototype.equals = function(geometry) {
    if (!(geometry instanceof Envelope)) {
        return false;
    }
    return (
        (
         this.childGeometries[0].equals(geometry.childGeometries[0]) &&
         this.childGeometries[1].equals(geometry.childGeometries[1])
        ) || (
         this.childGeometries[1].equals(geometry.childGeometries[0]) &&
         this.childGeometries[0].equals(geometry.childGeometries[1])
        )
    );
}

Envelope.prototype.clone = function() {
    return new Envelope(this.getMinX(), this.getMinY(), this.getMaxX(), this.getMaxY());
}

Envelope.prototype.getMinX = function() {
    return Math.min(this.childGeometries[0].x, this.childGeometries[1].x);
}

Envelope.prototype.getMinY = function() {
    return Math.min(this.childGeometries[0].y, this.childGeometries[1].y);
}

Envelope.prototype.getMaxX = function() {
    return Math.max(this.childGeometries[0].x, this.childGeometries[1].x);
}

Envelope.prototype.getMaxY = function() {
    return Math.max(this.childGeometries[0].y, this.childGeometries[1].y);
}

Envelope.prototype.getWidth = function() {
    return this.getMaxX() - this.getMinX();
}

Envelope.prototype.getHeight = function() {
    return this.getMaxY() - this.getMinY();
}

Envelope.prototype.grow = function(factor) {
    var displacementFactor = (factor - 1) / 2;
    var dx = width * displacementFactor;
    var dy = height * displacementFactor;
    var minX = this.getMinX() - dx;
    var minY = this.getMinY() - dy;
    var maxX = this.getMaxX() + dx;
    var maxY = this.getMaxY() + dy;
    this.childGeometries[0].setXY(minX, minY);
    this.childGeometries[1].setXY(maxX, maxY);
}

Envelope.prototype.toString = function() {
    return "Envelope(" + this.getMinX() + ", " + this.getMinY() + ", " + this.getMaxX() + ", " + this.getMaxY() + ")";
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/GeometryTools.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function GeometryTools() { }

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
        alert("No geometry given.");
    }
    if (!(geometry instanceof Point)) {
        alert("Given geometry is not a point. Only point geometries are currently supported.");
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
    
    alert("Given SRID transformation is currently not supported.");
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/LineString.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function LineString(points) {
    this.$parent = null;
    this.childGeometries = new Array();
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
    var clonedPoints = new Array();
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedPoints.push(this.childGeometries[i].clone());
    }
    return new LineString(clonedPoints);
}

LineString.prototype.getLength = function() {
    var length = 0;
    for (var i = 1; i < this.points.length; ++i) {
        length += this.points[i].getDistance(points[i - 1]);
    }
    return length;
}
	


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Polygon.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Polygon(lineStrings) {
    this.$parent = null;
    this.childGeometries = new Array();
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

Polygon.prototype.clone = function() {
    var clonedLineStrings = new Array();
    for (var i = 0; i < this.childGeometries.length; ++i) {
        clonedLineStrings.push(this.childGeometries[i].clone());
    }
    return new Polygon(clonedLineStrings);
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/WKTConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function WKTConverter() {
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
        geometry = GeometryTools.prototype.transform(geometry, 900913);
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

WKTConverter.prototype.wktToPath = function(wkt) {
    return wkt.replace(/[^\d]+$/, "").replace(/^[^\d]+([\d.\s]+),\s*/g, "M $1 L ").replace(/\)+,\s*\(+([\d.\s]+),\s*/g, " M $1 L ");
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/SVGConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function SVGConverter() { }

SVGConverter.prototype.geometryToPath = function(bounds, centerScale, geometry) {
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



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/Feature.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Feature(featureType, propertyValues) {
    this.featureType = featureType;
    this.propertyValues = propertyValues;
}

/*Feature.prototype.getProperties = function(){
	for(var i = 0; i < this.propertyValues.length; ++i){
		console.log(this.propertyValues[i]+ ' '+this.featureType.properties[i].type);
	}
}*/

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/FeatureModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function FeatureModel(features, type) {
    this.features = features;
    this.featureType = type;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/FeatureType.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function FeatureType(name, properties) {
    this.name = name;
    this.properties = properties;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/Property.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Property(name, type) {
  	this.name = name;
	this.type = type;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/PropertyType.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function PropertyType() { }

PropertyType.prototype.BOOLEAN = "boolean";
PropertyType.prototype.DOUBLE = "double";
PropertyType.prototype.INTEGER = "integer";
PropertyType.prototype.STRING = "string";
PropertyType.prototype.GEOMETRY = "geometry";


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/EmptyFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function EmptyFeatureCommand() {
}

EmptyFeatureCommand.prototype.perform = function() {
}

var defaultFeatureCommands = [new EmptyFeatureCommand(), new EmptyFeatureCommand(), new EmptyFeatureCommand()];



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: featuremodel/commands/SelectFeatureCommand.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function SelectFeatureCommand(selectionModel, index) {
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


function AggressiveSelectFeatureCommand(selectionModel, index) {
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


function ToggleSelectFeatureCommand(selectionModel, index) {
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


function ToURLFeatureCommand() { }

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


function CSVConverter() { }

CSVConverter.prototype.csvToFeatures = function(csv, simple, fieldSeparator, textDelimiter, featureType){
	var features = new Array();
	var lines = this.csvToLines(csv, simple, fieldSeparator, textDelimiter);
	var feature = null;
	var errorLines = new Array();
	for (var i = 0; i < lines.length; i++) {
		try {
			feature = this.lineToFeature(lines[i], featureType);
			features.push(feature);
		} catch (e) {
			errorLines.push(i);
		}
	}
	if (errorLines.length > 0) {
		alert("Could not convert " + errorLines.length + " out of " + lines.length + " csv lines to features. Error lines: " + errorLines);
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
		var fields = new Array();
		var lines = new Array();
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
					fields = new Array();
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
	var propertyTypes = featureType.properties;
	if (fields.length != propertyTypes.length) {
		alert("Number of fields of " + fields.length + " in the csv does not match the number of properties of " + propertyTypes.length + " in the featuretype. ");
	}
	var propertyValues = new Array();
	var wktConverter = new WKTConverter();
	for (var i = 0; i < propertyTypes.length; i++) {
		if (fields[i] == "") { 
			propertyValues.push(null); 
		} else if (propertyTypes[i].type == PropertyType.prototype.GEOMETRY) {
			propertyValues.push(wktConverter.wktToGeometry(fields[i]));
		} else {
			propertyValues.push(fields[i]);
		}
	}
	return new Feature(featureType, propertyValues);
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: filtermodel/converters/URLFilterConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function URLFilterConverter() { }

URLFilterConverter.filterModelsToURLFilter = function(filterModels) {
    var urlFilter = "";
    for (var i = 0; i < filterModels.length; i++) {
        if (filterModels[i] != null) {
            if (urlFilter.length > 0) {
                urlFilter += ":::";
            }
            urlFilter += URLFilterConverter.filterToURLFilter(filterModels[i].filter);
        }
    }
    
    return urlFilter;
}

URLFilterConverter.filterToURLFilter = function(filter) {
    var urlFilter = filter.propertyName + "::EQ::" + filter.value;
    
    return urlFilter;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/CenterScale.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function CenterScale(centerX, centerY, scale) {
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


function FocusModel() {
    this.animationTimer = new AnimationTimer(1000);
    this.incubationTimer = new Timer(1000, 1);
    this.maxEnvelope = new Envelope(-20000000, -20000000, 20000000, 20000000);
    this.minScale = 0;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animationBase = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        focusModel.animationCenterScale = focusModel.getAnimationCenterScale();
    };
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = focusModel.centerScale;
    };
}

// Click or touch while zooming/panning.
FocusModel.prototype.grab = function(x, y, pixXOffset, pixYOffset) {
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScale.scale == this.centerScale.scale) {
            this.animationTimer.reset();
            this.centerScale = this.animationCenterScale;
        } else {
            this.centerScale = this.centercon(new CenterScale(x, y, this.centerScale.scale).fromOffset(pixXOffset, pixYOffset));
            this.animationBase = {
                centerScale: new CenterScale(x, y, this.animationBase.centerScale.scale),
                pixXOffset: pixXOffset,
                pixYOffset: pixYOffset
            };
        }
        this.setIncubationCenterScale();
    }
}

// Pan with mouse move.
FocusModel.prototype.pan = function(dx, dy, pixXOffset, pixYOffset) {
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScale.scale == this.centerScale.scale) {
            this.animationTimer.reset();
            this.centerScale = this.animationCenterScale = this.centercon(
                new CenterScale(this.animationCenterScale.centerX + dx, this.animationCenterScale.centerY + dy, this.animationCenterScale.scale)
            );
        } else {
            this.centerScale = this.centercon(
                new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale)
            );
            this.animationBase.pixXOffset = pixXOffset;
            this.animationBase.pixYOffset = pixYOffset;
        }
    } else {
        this.centerScale = this.animationCenterScale = this.centercon(
            new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale)
        );
    }
    this.setIncubationCenterScale();
}

// Zoom with mouse wheel (animate == true) or pan/zoom with touch move/pinch (animate == false).
FocusModel.prototype.zoom = function(centerScale, pixXOffset, pixYOffset, animate) {
    centerScale = this.scalecon(centerScale, animate);
    if (animate && (this.animationCenterScale.scale == centerScale.scale)) {
        return;
    }
    if (!animate && (this.animationTimer.isRunning())) {
        this.animationTimer.reset();
    }
    
    this.centerScale = this.centercon(centerScale.fromOffset(pixXOffset, pixYOffset));
    if (animate) {
        this.animationBase = {
            centerScale: new CenterScale(centerScale.centerX, centerScale.centerY, this.animationCenterScale.scale),
            pixXOffset: pixXOffset,
            pixYOffset: pixYOffset
        };
        this.setAnimationCenterScale();
    } else {
        this.animationCenterScale = this.centerScale;
    }
    this.setIncubationCenterScale();
}

FocusModel.prototype.setCenterScale = function(centerScale, roundToZoomLevels) {
    if (centerScale == null) {
        return;
    }
    if (roundToZoomLevels == null) {
        roundToZoomLevels = true;
    }
    
    centerScale = this.centercon(this.scalecon(centerScale, roundToZoomLevels));
    if (this.centerScale == null) {
        this.centerScale = centerScale;
        this.animationBase = {centerScale: centerScale, pixXOffset: 0, pixYOffset: 0};
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.animationBase = {centerScale: this.animationCenterScale, pixXOffset: 0, pixYOffset: 0};
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

FocusModel.prototype.getAnimationCenterScale = function() {
    var pixXOffset = this.animationBase.pixXOffset;
    var pixYOffset = this.animationBase.pixYOffset;
    var base = this.animationBase.centerScale;
    var delta = this.centerScale.toOffset(pixXOffset, pixYOffset).subtract(base);
    var progress = this.animationTimer.currentCount / this.animationTimer.duration;
    
    return new CenterScale(
        base.centerX + (-delta.centerX * progress * progress + 2 * delta.centerX * progress),
        base.centerY + (-delta.centerY * progress * progress + 2 * delta.centerY * progress),
        base.scale + (-delta.scale * progress * progress + 2 * delta.scale * progress)
    ).fromOffset(pixXOffset, pixYOffset);
}

// Center-related conditions. Relevant for zooming and panning.
FocusModel.prototype.centercon = function(centerScale) {
    var centerX = Math.min(Math.max(centerScale.centerX, this.maxEnvelope.getMinX()), this.maxEnvelope.getMaxX());
    var centerY = Math.min(Math.max(centerScale.centerY, this.maxEnvelope.getMinY()), this.maxEnvelope.getMaxY());
    return new CenterScale(centerX, centerY, centerScale.scale);
}

// Scale-related conditions. Relevant for zooming only.
FocusModel.prototype.scalecon = function(centerScale, roundToZoomLevels) {
    if (centerScale.scale < this.minScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale), roundToZoomLevels);
    }
    if (centerScale.scale > this.maxScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale), roundToZoomLevels);
    }
    if (this.scaleToZoomLevels) {
        var zoomLevelScale = getZoomLevel(centerScale.scale, roundToZoomLevels).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    return centerScale;
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/EnvelopeCenterScale.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function EnvelopeCenterScale() {
    this.centerX = -1;
    this.centerY = -1;
    this.scale = -1;
    
    this.width = -1;
    this.height = -1;
    this.envelope = null;
}

EnvelopeCenterScale.prototype = new CenterScale();
EnvelopeCenterScale.prototype.constructor = EnvelopeCenterScale;

EnvelopeCenterScale.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    this.width = bounds.width;
    this.height = bounds.height;
    this.envelope = this.toEnvelope(this.width, this.height);
}

EnvelopeCenterScale.prototype.setCenterScale = function(centerScale) {
    if (centerScale == null) {
        return;
    }
    this.centerX = centerScale.centerX;
    this.centerY = centerScale.centerY;
    this.scale = centerScale.scale;
    this.envelope = this.toEnvelope(this.width, this.height);
}

EnvelopeCenterScale.prototype.equals = function(centerScale) {
    if (centerScale == null) {
        return false;
    }
    if (centerScale instanceof EnvelopeCenterScale) {
        if ((this.centerX = centerScale.centerX) && (this.centerY == centerScale.centerY) &&
            (this.scale == centerScale.scale) && (this.width == centerScale.width) && (this.height == centerScale.height)
        ) {
            return true;
        } else {
            return false;
        }
    }
    return this.equals(centerScale);
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: focusmodel/ZoomLevel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function ZoomLevel(zoomLevel, scale, resolution) {
    this.zoomLevel = zoomLevel;
    this.scale = scale;
    this.resolution = resolution;
}

var zoomLevels = [
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

function getZoomLevel(scale, round) {
    if ((round === undefined) || (round === false) || (round == "DOWN")) {
        for (var i = 0; i < zoomLevels.length - 1; i++) {
            if (scale >= zoomLevels[i].scale) {
                return zoomLevels[i];
            }
        }
        return zoomLevels[zoomLevels.length - 1];
    } else if ((round === true) || (round == "ROUND")) {
        for (var i = 0; i < zoomLevels.length - 1; i++) {
            if (scale >= (zoomLevels[i].scale + zoomLevels[i + 1].scale) / 2) {
                return zoomLevels[i];
            }
        }
        return zoomLevels[zoomLevels.length - 1];
    } else {  // round == "UP"
        for (var i = zoomLevels.length - 1; i > 0; i--) {
            if (scale <= zoomLevels[i].scale) {
                return zoomLevels[i];
            }
        }
        return zoomLevels[0];
    }
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/Layer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Layer(name) {
    this.name = name;
    this.baseURL = "http://b.tile.openstreetmap.org/";
    this.styleURL = null;
    this.urlExtension = "$Z/$X/$Y.png";
    this.srs = "EPSG:900913";
    this.format = "image/png";
    this.visible = true;
    this.title = name;
    this.filterModels = [];
    this.classification = null;
    this.vendorSpecifics = {};
}

Layer.prototype.forceReload = function() {
    this.vendorSpecifics.epochtime = (new Date()).getTime();
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/Tile.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Tile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
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
    var minPixX = centerScale.getPixX(bounds.width, envelope.getMinX());
    var minPixY = centerScale.getPixY(bounds.height, envelope.getMaxY());
    var maxPixX = centerScale.getPixX(bounds.width, envelope.getMaxX());
    //var maxPixY = centerScale.getPixY(bounds.height, envelope.getMinY());
    
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


function TileModel() {
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.minX = -285401.92;
    this.maxY = 903401.9199999999;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
    this.http = null;  // Used only for UTFGrid tile models.
}

TileModel.prototype.setBounds = function(bounds) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.resetLoaders();
}

TileModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.resetLoaders();
}

TileModel.prototype.setLayer = function(layer) {
    this.layer = layer;
    this.tiles = [];
    this.tileIndex = {};
    this.resetLoaders();
}

TileModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if ((this.layer == null) || !this.layer.visible) {
        return;
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    } else {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].completed = false;
        }
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.getMinX() - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.getMaxY()) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.getMaxX() - this.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.getMinY()) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if ((tile == null) || (!tile.completed)) {
                var minX = tileX * this.tileWidth * zoomLevel.resolution + this.minX;
                var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.maxY);
                
                if (this.ctx != null) {
                    this.drawTilesAroundZoomLevel(zoomLevel.zoomLevel, minX, maxY);
                }
                
                if (tile == null) {
                    var url = this.layer.urlExtension;
                    url = url.replace("$Z", zoomLevel.zoomLevel);
                    url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                    url = url.replace("$Y", tileY);
                    
                    tile = new Tile(minX, maxY, zoomLevel.scale, tileX, tileY, this.tileWidth, this.tileHeight, this.layer.baseURL + url);
                    this.addTile(zoomLevel.zoomLevel, tile);
                    
                    if (this.ctx != null) {
                        var e = function(t, env) {
                            return function() {
                                t.completed = true;
                                if (getZoomLevel(env.centerScale.scale) == getZoomLevel(t.scale)) {
                                    t.reset(env.bounds, env.centerScale);
                                    env.drawTile(t);
                                }
                            }
                        }(tile, this);
                        tile.data = new Image();
                        tile.data.addEventListener("load", e);
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
                
                if (this.ctx == null) {
                    tile.reset(this.bounds, this.centerScale);
                    tile.completed = true;
                }
            } else {  // Completed tile exists. Only applies to tile models that draw on a canvas (ctx).
                tile.reset(this.bounds, this.centerScale);
                this.drawTile(tile);
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

TileModel.prototype.drawTilesAroundZoomLevel = function(zl, minX, maxY) {
    // Find any completed tile in the zoom levels above the given zoom level.
    for (var i = zl - 1; i >= 0; i--) {
        var zoomLevel = zoomLevels[i];
        var zoomFactor = Math.pow(2, zl - i);
        var subTileX = Math.round((minX - this.minX) / zoomLevel.resolution / this.tileWidth * zoomFactor) / zoomFactor;
        var tileX = Math.floor(subTileX);
        var subTileY = Math.round((this.maxY - maxY) / zoomLevel.resolution / this.tileHeight * zoomFactor) / zoomFactor;
        var tileY = Math.max(Math.floor(subTileY), 0);
        var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
        if ((tile != null) && (tile.completed)) {
            tile.resetWithPoint(this.bounds, this.centerScale, minX, maxY);
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
    if (zl == zoomLevels.length - 1) {
        return;
    }
    var zoomLevel = zoomLevels[zl + 1];
    var leftTileX = Math.round((minX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.round((this.maxY - maxY) / zoomLevel.resolution / this.tileHeight), 0);
    for (var tileY = topTileY; tileY <= topTileY + 1; tileY++) {
        for (var tileX = leftTileX; tileX <= leftTileX + 1; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            if ((tile != null) && (tile.completed)) {
                tile.reset(this.bounds, this.centerScale);
                this.drawTile(tile);
            }
        }
    }
}

TileModel.prototype.drawTile = function(tile) {
    this.ctx.drawImage(
        tile.data,
        Math.round(tile.x), Math.round(tile.y),
        Math.ceil(tile.scaling * this.tileWidth), Math.ceil(tile.scaling * this.tileHeight)
    );
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: layermodel/UTFGridModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function UTFGridModel() {
    this.http = null;
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.minX = -20037508.3427892;
    this.maxY = 20037508.3427892;
    this.tiles = [];
    this.tileIndex = {};
    
    this.resolution = 4;
}

UTFGridModel.prototype = new TileModel();
UTFGridModel.prototype.constructor = UTFGridModel;

UTFGridModel.prototype.getFeature = function(pixX, pixY) {
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var worldX = this.centerScale.getWorldX(this.bounds.width, pixX);
    var worldY = this.centerScale.getWorldY(this.bounds.height, pixY);
    var tileX = Math.floor((worldX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var tileY = Math.max(Math.floor((this.maxY - worldY) / zoomLevel.resolution / this.tileHeight), 0);
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


function WMSModel() {
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.autoClassification = true;
    this.tile = null;
}

WMSModel.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
        return;
    }
    
    this.bounds = bounds;
    this.load();
}

WMSModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.load();
}

WMSModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationCenterScale = animationCenterScale;
    this.resetLoaders();
}

WMSModel.prototype.load = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.getMinX();
    var minY = envelope.getMinY();
    var maxX = envelope.getMaxX();
    var maxY = envelope.getMaxY();
    
    if ((minX > 20000000) || (minY > 20000000) || (maxX < -20000000) || (maxY < -20000000)) {
        return;
    }
    
    minX = Math.max(minX, -20000000);
    minY = Math.max(minY, -20000000);
    maxX = Math.min(maxX, 20000000);
    maxY = Math.min(maxY, 20000000);
    
    var tileWidth = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var tileHeight = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
    var url = this.layer.baseURL;
    url += (url.indexOf("?") == -1 ? "?" : "&") + "SERVICE=WMS";
    url += "&VERSION=1.1.1";
    url += "&REQUEST=GetMap";
    
    if (this.layer.styleURL == null) {
        url += "&LAYERS=" + this.layer.name;
        url += "&STYLES=";
    } else {
        var sldURL = this.layer.styleURL;
        if (this.layer.name != null) {
            sldURL += "?layer=" + this.layer.name;
        }
        var urlFilter = URLFilterConverter.filterModelsToURLFilter(this.layer.filterModels);
        if (urlFilter.length > 0) {
            sldURL += "&filter=" + urlFilter;
        }
        if (this.layer.classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(this.layer.classification));
            if ((urlFilter.length == 0) || (!this.autoClassification)) {
                sldURL += "::noFilter";
            }
        }
        url += "&SLD=" + encodeURIComponent(sldURL);
    }
    url += "&TRANSPARENT=true";
    url += "&SRS=" + this.layer.srs;
    url += "&BBOX=" + minX + "," + minY + "," + maxX + "," + maxY;
    url += "&WIDTH=" + tileWidth;
    url += "&HEIGHT=" + tileHeight;
    url += "&FORMAT=" + this.layer.format;
    url += "&EXCEPTIONS=application/vnd.ogc.se_xml";
    
    angular.forEach(this.layer.vendorSpecifics, function(value, key) {
        url += "&" + key + "=" + value;
    });
    
    if ((this.tile == null) || (this.tile.url != url)) {
        this.tile = new Tile(minX, maxY, this.centerScale.scale, 1, 1, tileWidth, tileHeight, url);
    }
    this.tile.reset(this.bounds, this.animationCenterScale);
}

WMSModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    if (this.tile == null) {
        return;
    }
    
    this.tile.reset(this.bounds, this.animationCenterScale);
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: selectionmodel/SelectionModel.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function SelectionModel() {
    this.selectedFeatures = null;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: service/file/CSVServiceConnector.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function CSVServiceConnector(http, id, fieldSeparator, simple, featureType, url) {
	this.http = http;
	this.id = id;
    this.fieldSeparator = fieldSeparator;
    this.textDelimiter = "\"";
    this.featureType = featureType;
    this.url = url;
    this.simple = simple;
}

CSVServiceConnector.prototype.load = function(scope, callback) {
	var obj = this;
	var csvConverter = new CSVConverter();
	var features = new Array();
	this.http({method: 'GET', url: this.url}).
  	success(function(data, status, headers, config) {
  		features = csvConverter.csvToFeatures(data, obj.simple, obj.fieldSeparator, obj.textDelimiter, obj.featureType);
  		var featureModel = new FeatureModel(features, obj.featureType);
  		console.log(featureModel);
  		callback(scope, obj.id, featureModel);
  	}).
  	error(function(data, status, headers, config) {
    	alert('error'+status);
  	});	
  	
} 
 

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: stylemodel/converters/URLClassificationConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function URLClassificationConverter() { }

URLClassificationConverter.classificationToURLClassification = function(classification) {
    var urlClassification = classification.propertyName + "::";
    
    urlClassification += classification.numClasses + "::";
    
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
/* Merging js: niney.angular.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


angular.module("niney", ["monospaced.mousewheel"]).
    factory("heartbeatTimer", ["$rootScope", function($rootScope) {
        var timer = new Timer(2000, -1);
        timer.scope = $rootScope;
        timer.timerHandler = function() {
            for (var i = 0; i < timer.subTimerHandlers.length; i++) {
                timer.subTimerHandlers[i].apply();
            }
        };
        timer.subTimerHandlers = [];
        timer.addSubTimerHandler = function(subTimerHandler) {
            timer.subTimerHandlers.push(subTimerHandler);
        };
        timer.removeSubTimerHandler = function(subTimerHandler) {
            for (var i = 0; i < timer.subTimerHandlers.length; i++) {
                if (timer.subTimerHandlers[i] == subTimerHandler) {
                    timer.subTimerHandlers.splice(i, 1);
                    return;
                }
            }
        };
        timer.start();
        return timer;
    }]).
    factory("windowBoundsModel", ["$rootScope", "$window", function($rootScope, $window) {
        var model = new BoundsModel();
        model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
        $window.addEventListener("resize", function(resizeEvent) {
            $rootScope.$apply(function() {
                model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
            });
        });
        return model;
    }]).
    factory("defaultBoundsModel", function() {
        return new BoundsModel();
    }).
    factory("defaultFocusModel", ["$rootScope", function($rootScope) {
        var model = new FocusModel();
        model.animationTimer.scope = $rootScope;
        model.incubationTimer.scope = $rootScope;
        return model;
    }]).
    factory("defaultEnvelopeModel", function() {
        return new EnvelopeCenterScale();
    }).
    factory("defaultAnimationEnvelopeModel", function() {
        return new EnvelopeCenterScale();
    }).
    factory("defaultTilesLayer", function() {
        return new Layer("Tiles");
    }).
    run(function($rootScope, defaultBoundsModel, defaultFocusModel, defaultEnvelopeModel, defaultAnimationEnvelopeModel) {
        $rootScope.defaultBoundsModel = defaultBoundsModel;
        $rootScope.defaultFocusModel = defaultFocusModel;
        
        $rootScope.$watch("defaultBoundsModel.bounds", function(val) {
            defaultEnvelopeModel.setBounds(val);
            defaultAnimationEnvelopeModel.setBounds(val);
        });
        $rootScope.$watch("defaultFocusModel.centerScale", function(val) {
            defaultEnvelopeModel.setCenterScale(val);
        });
        $rootScope.$watch("defaultFocusModel.animationCenterScale", function(val) {
            defaultAnimationEnvelopeModel.setCenterScale(val);
        });
    }).
    directive("legend", function() {
        return {
            template: '<div><ul><li ng-repeat="layer in layers"><label class="visible-{{layer.visible}}"><input type="checkbox" ng-model="layer.visible"/>{{layer.title}}</label></li></ul></div>',
            restrict: "EA",
            replace: true,
            scope: {
                layers: "=layers"
            }
        };
    }).
    directive("map", ["$document", "heartbeatTimer", "defaultBoundsModel", "defaultFocusModel", "defaultAnimationEnvelopeModel", function($document, heartbeatTimer, defaultBoundsModel, defaultFocusModel, defaultAnimationEnvelopeModel) {
        return {
            template: '<div ng-transclude msd-wheel="mouseWheelHandler($event, $delta, $deltaX, $deltaY)" class="mapviewer"></div>',
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=?boundsmodel",
                focusModel: "=?focusmodel",
                envelopeModel: "=?envelopemodel",
                mouseWheelAction: "@mousewheelaction",
                tapFunction: "=nTap",
                pressFunction: "=nPress",
                releaseFunction: "=nRelease",
                mouseMoveFunction: "=nMouseMove"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            link: function($scope, $element, $attr) {
                $scope.$watch("boundsModel", function(val) {
                    if (val == null) {
                        $scope.boundsModel = defaultBoundsModel;
                    } else {
                        val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        heartbeatTimer.addSubTimerHandler(function() {
                            val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        });
                    }
                });
                $scope.$watch("focusModel", function(val) {
                    if (val == null) {
                        $scope.focusModel = defaultFocusModel;
                    }
                });
                $scope.$watch("envelopeModel", function(val) {
                    if (val == null) {
                        $scope.envelopeModel = defaultAnimationEnvelopeModel;
                    }
                });
                
                var mouseWheelTime = (new Date()).getTime();
                var mouseWheelDelta = -1;
                
                $scope.mouseWheelHandler = function(mouseEvent, delta, deltaX, deltaY) {
                    mouseEvent.preventDefault();
                    
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    
                    var cs = $scope.focusModel.centerScale;
                    var acs = $scope.focusModel.animationCenterScale;
                    
                    if ($scope.mouseWheelAction == "HORIZONTAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX - acs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX + acs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        }
                    } else if ($scope.mouseWheelAction == "VERTICAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY + acs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY - acs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        }
                    } else {  // ZOOM
                        var now = (new Date()).getTime();
                        if (!$scope.focusModel.scaleToZoomLevels || (now - mouseWheelTime > 250) || (mouseWheelDelta * delta < 0)) {
                            mouseWheelTime = now;
                            mouseWheelDelta = delta;
                            
                            var mouseX = mouseEvent.originalEvent.clientX - $element[0].getBoundingClientRect().left;
                            var mouseY = mouseEvent.originalEvent.clientY - $element[0].getBoundingClientRect().top;
                            
                            var worldX = acs.getWorldX(width, mouseX);
                            var worldY = acs.getWorldY(height, mouseY);
                            var scale = cs.scale;
                            
                            if (!$scope.focusModel.scaleToZoomLevels) {
                                if (delta > 0) {
                                    scale /= 1.3;
                                } else {
                                    scale *= 1.3;
                                }
                            } else {
                                if (delta > 0) {
                                    scale /= 2;
                                } else {
                                    scale *= 2;
                                }
                            }
                            var pixXOffset = mouseX - (width / 2);
                            var pixYOffset = mouseY - (height / 2);
                            
                            $scope.focusModel.zoom(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, true);
                        }
                    }
                };
                
                $element.on("mousedown", pressHandler);
                $element.on("touchstart", pressHandler);
                
                var pressX = -1;
                var pressY = -1;
                var panTimer = new PanSpeedTimer(50, -1); // Role of timer is 2-fold: measure pan speed, but also apply digest cycle every tick.
                panTimer.scope = $scope;
                
                function pressHandler(event) {
                    if (panTimer.isRunning()) {  // From 1 to 2 fingers is not a true press anymore.
                        return;
                    }
                    
                    event.preventDefault();
                    decorateTouchEvent(event, false);
                    
                    pressX = event.clientX - $element[0].getBoundingClientRect().left;
                    pressY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, pressX);
                    var worldY = cs.getWorldY(height, pressY);
                    
                    var pixXOffset = pressX - (width / 2);
                    var pixYOffset = pressY - (height / 2);
                    
                    $scope.focusModel.grab(worldX, worldY, pixXOffset, pixYOffset);
                    
                    if (event.type == "mousedown") {
                        $document.on("mousemove", mouseMoveHandler);
                        $document.on("mouseup", releaseHandler);
                    } else {  // touchstart
                        $document.on("touchmove", touchMoveHandler);
                        $document.on("touchend", releaseHandler);
                        $document.on("touchcancel", releaseHandler);
                    }
                    
                    panTimer.panEvent = event;
                    panTimer.start();
                    
                    if ($scope.pressFunction != null) {
                        $scope.$apply($scope.pressFunction(worldX, worldY));
                    }
                };
                
                function mouseMoveHandler(mouseEvent) {
                    mouseEvent.preventDefault();
                    
                    var mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    var mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                    
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    
                    if (panTimer.panEvent != null) {
                        var dx = cs.getNumWorldCoords(mouseEvent.clientX - panTimer.panEvent.clientX);
                        var dy = cs.getNumWorldCoords(mouseEvent.clientY - panTimer.panEvent.clientY);
                        
                        var pixXOffset = mouseX - (width / 2);
                        var pixYOffset = mouseY - (height / 2);
                        
                        $scope.focusModel.pan(-dx, dy, pixXOffset, pixYOffset);
                        
                        panTimer.panEvent = mouseEvent;
                    } else {
/*                      var worldX = cs.getWorldX(width, mouseX);
                        var worldY = cs.getWorldY(height, mouseY);
                        
                        if ($scope.mouseMoveFunction != null) {
                            $scope.$apply($scope.mouseMoveFunction(worldX, worldY));
                        }*/
                    }
                }
                
                function touchMoveHandler(touchEvent) {
                    touchEvent.preventDefault();
                    decorateTouchEvent(touchEvent, false);
                    
                    if (touchEvent.touches.length == panTimer.panEvent.touches.length) {
                        var pinchX = touchEvent.clientX - $element[0].getBoundingClientRect().left;
                        var pinchY = touchEvent.clientY - $element[0].getBoundingClientRect().top;
                        
                        var width = $scope.boundsModel.bounds.width;
                        var height = $scope.boundsModel.bounds.height;
                        
                        var cs = $scope.focusModel.animationCenterScale;
                        var worldX = cs.getWorldX(width, pinchX);
                        var worldY = cs.getWorldY(height, pinchY);
                        var scale = cs.scale / (touchEvent.radius / panTimer.panEvent.radius);
                        
                        var pixXOffset = pinchX + (touchEvent.clientX - panTimer.panEvent.clientX) - (width / 2);
                        var pixYOffset = pinchY + (touchEvent.clientY - panTimer.panEvent.clientY) - (height / 2);
                        
                        $scope.focusModel.zoom(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, false);
                    }
                    
                    panTimer.panEvent = touchEvent;
                }
                
                function releaseHandler(event) {
                    if ((event.touches != null) && (event.touches.length > 0)) {  // From 2 to 1 fingers is not a true release yet.
                        return;
                    }
                    
                    var releaseX = event.clientX - $element[0].getBoundingClientRect().left;
                    var releaseY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, releaseX);
                    var worldY = cs.getWorldY(height, releaseY);
                    
                    var tolerance = 0;
                    
                    var speed = panTimer.resetAndGetSpeed();
                    if ((speed.h == 0) || (speed.v == 0)) {
                        panTimer.tick();
                    } else {
                        $scope.focusModel.setCenterScale(new CenterScale(
                            cs.centerX - cs.getNumWorldCoords(speed.h) * 1000 / 4,  // * animationDuration / 2 ^ deceleration
                            cs.centerY + cs.getNumWorldCoords(speed.v) * 1000 / 4,
                            cs.scale
                        ), (event.type == "mouseup"));  // On touch devices, don't do the zoom level check.
                    }
                    
                    if (event.type == "mouseup") {
                        $document.off("mousemove", mouseMoveHandler);
                        $document.off("mouseup", releaseHandler);
                    } else {  // touchend || touchcancel
                        $document.off("touchmove", touchMoveHandler);
                        $document.off("touchend", releaseHandler);
                        $document.off("touchcancel", releaseHandler);
                        
                        tolerance = 100;
                    }
                    
                    panTimer.panEvent = null;
                    
                    if ($scope.releaseFunction != null) {
                        $scope.$apply($scope.releaseFunction(worldX, worldY));
                    }
                    if (($scope.tapFunction != null) && (
                        (pressX - releaseX) * (pressX - releaseX) + (pressY - releaseY) * (pressY - releaseY) <= tolerance * tolerance)
                    ) {
                        $scope.$apply($scope.tapFunction(worldX, worldY));
                    }
                }
            }
        };
    }]).
    directive("tilelayer", function() {
        return {
            template: '<div class="tileslayer"><img ng-if="layer.visible" ng-src="{{tile.url}}" style="position: absolute" ng-style="tile.toCSS()"/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                envelope: "=envelope",
                centerScale: "=?centerscale"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tile = null;
                
                $parentCtrl.scope.$watch("boundsModel.bounds", function(val) { resetTile(); });
                $parentCtrl.scope.$watch("focusModel.animationCenterScale", function(val) { if ($scope.centerScale == null) resetTile(); });
                
                $scope.$watch("layer", function(val) { $scope.tile = new Tile(-1, -1, 1, 1, 1, val.tileWidth, undefined, val.baseURL); resetTile(); });
                $scope.$watch("envelope", function(val) { resetTile(); });
                $scope.$watch("centerScale", function(val) { resetTile(); });
                
                function resetTile() {
                    if ($scope.tile == null) {
                        return;
                    }
                    if ($parentCtrl.scope.boundsModel.bounds == null) {
                        return;
                    }
                    if ($scope.envelope == null) {
                        return;
                    }
                    if (($scope.centerScale == null) && ($parentCtrl.scope.focusModel.animationCenterScale == null)) {
                        return;
                    }
                    
                    $scope.tile.resetWithEnvelope($parentCtrl.scope.boundsModel.bounds, $scope.centerScale || $parentCtrl.scope.focusModel.animationCenterScale, $scope.envelope);
                }
            }
        };
    }).
    directive("tileslayer", ["defaultTilesLayer", function(defaultTilesLayer) {
        return {
            template: '<canvas ng-show="tileModel.layer.visible" width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="tileslayer"></canvas>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                $scope.tileModel.ctx = $element[0].getContext("2d");
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
                $scope.$watch("layer", function(val) { $scope.tileModel.setLayer(val || defaultTilesLayer); });
                $scope.$watch("tileModel.layer.visible", function(val) { $scope.tileModel.resetLoaders(); });
            }
        };
    }]).
    directive("utfgridlayer", ["$http", function($http) {
        return {
            template: '<div ng-mousemove="mouseMoveHandler($event)" class="tileslayer"></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                featureCommands: "=featurecommands"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.utfGridModel = new UTFGridModel();
                $scope.utfGridModel.http = $http;
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.utfGridModel.layer = val; });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.utfGridModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.utfGridModel.setCenterScale(val); });
                
                $scope.mouseMoveHandler = function(mouseEvent) {
                    var mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    var mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                    
                    $scope.featureCommands[0].perform($scope.utfGridModel.getFeature(mouseX, mouseY));
                };
                
                $element.on("mousedown", pressHandler);
                $element.on("touchstart", pressHandler);
                
                function pressHandler(event) {
                    decorateTouchEvent(event, true);
                    
                    var pressX = event.clientX - $element[0].getBoundingClientRect().left;
                    var pressY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    $scope.featureCommands[2].perform($scope.utfGridModel.getFeature(pressX, pressY));
                };
            }
        };
    }]).
    directive("wmslayer", function() {
        return {
            template: '<div class="wmslayer"><img maploader ng-if="layer.visible" ng-show="wmsModel.tile.completed" ng-src="{{wmsModel.tile.url}}" style="position: absolute" ng-style="wmsModel.tile.toCSS()"/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.wmsModel = new WMSModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.wmsModel.layer = val; $scope.wmsModel.load(); }, true);
                $scope.$watch("boundsModel.bounds", function(val) { $scope.wmsModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.wmsModel.setAnimationCenterScale(val); });
                $scope.$watch("focusModel.incubationCenterScale", function(val) { $scope.wmsModel.setCenterScale(val); });
            }
        };
    }).
    directive("maploader", function() {
        return {
            restrict: "A",
            link: function($scope, $element, $attr) {
                $element.on("load", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
                $element.on("error", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
            }
        };
    }).
    directive("mapfeaturelayer", function() {
        return {
            template: '<div class="mapfeaturelayer"></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            transclude: true,
            scope: {
                layer: "=layer",
                featureModel: "=featuremodel",
                selectionModel: "=selectionmodel",
                featureCommands: "=?featurecommands"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            compile: function(element, attr, transclude) {
                return function($scope, $element, $attr, $parentCtrl) {
                    $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                    $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                    $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                    
                    var childElement, childScope;
                    $scope.$watch("layer.visible", function(val) {
                        if (childElement) {
                            $element.contents().remove();
                            childElement = undefined;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = undefined;
                        }
                        if (val) {
                            childScope = $scope.$new();
                            transclude(childScope, function(clone) {
                                childElement = clone;
                                $element.append(clone);
                            });
                        }
                    });
                }
            }
        };
    }).
    directive("canvassymbolizer", function() {
        return {
            template: '<canvas width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="mapfeaturelayer"></canvas>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                maxScale: "=?maxscale",
                propertyIndex: "=propertyindex",
                deepWatch: "=?deepwatch",
                envelopeCheck: "=?envelopecheck",
                inverseFill: "=?inversefill"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                
                $scope.$watch("maxScale", function(val) { if (!angular.isDefined(val)) { $scope.maxScale = Number.MAX_VALUE; }});
                $scope.$watch("deepWatch", function(val) { if (!angular.isDefined(val) || val) {
                    $scope.$watch("featureModel.features", watchHandler, true);
                } else {
                    $scope.$watchCollection("featureModel.features", watchHandler);
                }});
                $scope.$watch("envelopeCheck", function(val) { if (!angular.isDefined(val)) { $scope.envelopeCheck = true; }});
                $scope.$watch("inverseFill", function(val) { if (!angular.isDefined(val)) { $scope.inverseFill = false; }});
                $scope.$watch("envelopeModel.envelope", watchHandler);
                
                // Not every envelope change is caused by a resize, so don't change width/height in the watch handler.
                function watchHandler(val) {
                    if ($scope.boundsModel == null) {
                        return;
                    }
                    
                    var ctx = $element[0].getContext("2d");
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    ctx.setTransform(1, 0, 0, 1, 0, 0);  // ctx.resetTransform();
                    ctx.clearRect(0, 0, width, height);
                    
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    var centerScale = $scope.focusModel.animationCenterScale;
                    var scaling = centerScale.getNumPixs(1);
                    var dx = -centerScale.centerX * scaling + width / 2;
                    var dy = centerScale.centerY * scaling + height / 2;
                    ctx.setTransform(scaling, 0, 0, -scaling, dx, dy);
                    
                    var css = getComputedStyle($element[0]);
                    ctx.fillStyle = css.getPropertyValue("fill");
                    ctx.strokeStyle = css.getPropertyValue("stroke");
                    ctx.lineWidth = parseInt(css.getPropertyValue("stroke-width")) / scaling;
                    
                    for (var i = 0; i < $scope.featureModel.features.length; i++) {
                        var geometry = $scope.featureModel.features[i].propertyValues[$scope.propertyIndex];
                        if (geometry instanceof Geometry) {
                            if (!$scope.envelopeCheck || (geometry.intersects($scope.envelopeModel.envelope))) {
                                var geometries = getGeometries(geometry);
                                for (var j = 0; j < geometries.length; j++) {
                                    var geometry = geometries[j];
                                    if (!$scope.envelopeCheck || (geometry.intersects($scope.envelopeModel.envelope))) {
                                        var path = (new SVGConverter()).geometryToPath($scope.boundsModel.bounds, centerScale, geometry);
                                        draw(ctx, path);
                                    }
                                }
                            }
                        } else {  // geometry is a path string.
                            draw(ctx, geometry);
                        }
                    }
                }
                
                function getGeometries(geometry) {
                    var geometries = null;
                    if (geometry instanceof Point) {
                        geometries = [new LineString(geometry, geometry)];
                    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
                        geometries = [geometry];
                    } else {  // geometry is a multi-geometry or geometry collection.
                        geometries = geometry.childGeometries;
                    }
                    return geometries;
                }
                
                function draw(ctx, path) {
                    if ($scope.inverseFill) {
                        var envelope = $scope.envelopeModel.envelope;
                        var minx = envelope.getMinX();
                        var miny = envelope.getMinY();
                        var maxx = envelope.getMaxX();
                        var maxy = envelope.getMaxY();
                        var path = "M " + minx + " " + miny + " " + " L " + maxx + " " + miny + " " + maxx + " " + maxy + " " + minx + " " + maxy + " Z " + path;
                    }
                    if (typeof Path2D === "function") {
                        var p = new Path2D(path);
                        ctx.fill(p, "evenodd");
                        ctx.filter = getComputedStyle($element[0]).getPropertyValue("--stroke-filter");
                        ctx.stroke(p);
                        ctx.filter = "none";
                    } else {  // Polyfill for IE11.
                        ctx.beginPath();
                        path = path.replace(/,/g, " ");
                        var pathItems = path.split(" ");
                        for (var i = 0; i < pathItems.length; i++) {
                            if ((pathItems[i] == "") || (pathItems[i] == "Z") || (pathItems[i] == "L")) {
                                continue;
                            }
                            if (pathItems[i] == "M") {
                                ctx.moveTo(pathItems[++i], pathItems[++i]);
                            } else {
                                ctx.lineTo(pathItems[i], pathItems[++i]);
                            }
                        }
                        ctx.fill("evenodd");
                        ctx.filter = getComputedStyle($element[0]).getPropertyValue("--stroke-filter");
                        ctx.stroke();
                        ctx.filter = "none";
                    }
                }
            }
        };
    }).
    directive("geometrysymbolizer", ["$filter", function($filter) {
        return {
            template: '<div class="mapfeaturelayer"><div ng-if="maxScale >= focusModel.animationCenterScale.scale" class="mapfeaturelayer"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" ng-repeat="feature in filteredFeatures" class="mapfeature"><path ng-repeat="geometry in getFilteredGeometries(feature)" d="{{toSVGPoints(boundsModel.bounds, focusModel.animationCenterScale, geometry)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapgeometry\' + \' \' + highClass: \'mapgeometry\'"/></svg></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.filteredFeatures = [];
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                $scope.$watch("envelopeModel.envelope", watchHandler);
                $scope.$watch("featureModel.features", watchHandler, true);
                
                function watchHandler(val) {
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if (($scope.envelopeModel == null) || ($scope.envelopeModel.envelope == null)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    $scope.filteredFeatures = $filter("filter")($scope.featureModel.features, function(item) {
                        var featureEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                        return featureEnvelope.intersects($scope.envelopeModel.envelope);
                    });
                };
                
                $scope.getFilteredGeometries = function(feature) {
                    var geometry = feature.propertyValues[$scope.propertyIndex];
                    var geometries = null;
                    if (geometry instanceof Point) {
                        geometries = [new LineString(geometry, geometry)];
                    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
                        geometries = [geometry];
                    } else {  // Multi-geometry or geometry collection.
                        geometries = geometry.childGeometries;
                    }
                    return $filter("filter")(geometries, function(item) {
                        var geometryEnvelope = item.getEnvelope();
                        return geometryEnvelope.intersects($scope.envelopeModel.envelope);
                    });
                };
                $scope.toSVGPoints = (new SVGConverter()).geometryToPath;
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
                $scope.isSelected = function(feature) {
                    if ($scope.selectionModel == null) {
                        return false;
                    }
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        };
    }]).
    directive("imagesymbolizer", ["$filter", function($filter) {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in filteredFeatures" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(feature.propertyValues[propertyIndex])"/></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                assetPropertyIndex: "@assetpropertyindex",
                asset: "@asset",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.filteredFeatures = [];
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                $scope.$watch("envelopeModel.envelope", watchHandler);
                $scope.$watch("featureModel.features", watchHandler, true);
                
                function watchHandler(val) {
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if (($scope.envelopeModel == null) || ($scope.envelopeModel.envelope == null)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    $scope.filteredFeatures = $filter("filter")($scope.featureModel.features, function(item) {
                        var featureEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                        return featureEnvelope.intersects($scope.envelopeModel.envelope);
                    });
                };
                
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
                $scope.isSelected = function(feature) {
                    if ($scope.selectionModel == null) {
                        return false;
                    }
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
                $scope.getCSS = function(geometry) {
                    var css = {};
                    css.left = $scope.focusModel.animationCenterScale.getPixX($scope.boundsModel.bounds.width, geometry.x) + "px";
                    css.top = $scope.focusModel.animationCenterScale.getPixY($scope.boundsModel.bounds.height, geometry.y) + "px";
                    return css;
                }
            }
        };
    }]).
    directive("geometryimagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale" ng-repeat="feature in featureModel.features"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:intersectsEnvelope track by $index" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(geometry)"/></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                assetPropertyIndex: "@assetpropertyindex",
                asset: "@asset",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.envelope);
                };
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
                $scope.isSelected = function(feature) {
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
                $scope.getCSS = function(geometry) {
                    var css = {};
                    css.left = $scope.focusModel.animationCenterScale.getPixX($scope.boundsModel.bounds.width, geometry.x) + "px";
                    css.top = $scope.focusModel.animationCenterScale.getPixY($scope.boundsModel.bounds.height, geometry.y) + "px";
                    return css;
                }
            }
        };
    });

