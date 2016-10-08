

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "mergejs.txt" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Fri Oct 7 21:31:10 CEST 2016  */

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

function PanSpeedTimer(delay, numRepeats) {
    this.delay = delay;
    this.numRepeats = numRepeats;
    this.currentCount = 0;
    this.panEvent = null;
    this.lastPoint0 = null;
    this.lastPoint1 = null;
    this.lastPointWas0 = false;
    this.speed = {h: -1, v: -1};
    this.scope = null;
    this.interval = -1;
    
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


function Geometry(){ 
    this.parent = null;
	this.envelope = null;
	this.childGeometries = new Array();
}

Geometry.prototype.setParent = function(parent) {
	if(this.parent == parent) {
		return;
	}
	if(this.parent != null) {
		var previousParent = this.parent;
		this.parent = null;
		previousParent.removeChild(this);
	}
	if(parent != null) {
		this.parent = parent;
		parent.addChild(this);
	}
	this.parent = parent;
}	

Geometry.prototype.getParent = function() {
	return this.parent;
}

Geometry.prototype.addChild = function(child) {}

Geometry.prototype.removeChild = function(child) {}

Geometry.prototype.getChildGeometries = function() {
	return null;
}

Geometry.prototype.isChild = function(child) {
	var _childGeometries = this.getChildGeometries();
	for(var i = 0; i < _childGeometries.length; ++i) {
		if(_childGeometries[i] == child){
			return true;
		}
	}
	return false;
}

Geometry.prototype.getPoints = function() {
	var points = new Array();
	var _childGeometries = this.getChildGeometries();
	for(var i = 0; i < _childGeometries.length; ++i) {
		points = points.concat(_childGeometries[i].getPoints());
	}
	return points;
}

Geometry.prototype.getEndPoint = function() {
	return this.points[this.points.length - 1];
}

Geometry.prototype.getCenterPoint = function() {
	var sumX = 0;
	var sumY = 0;
	for(var i = 0; i < this.points.length; ++i) {
		sumX += this.points[i].x;
		sumY += this.points[i].y;
	}
	var numPoints = this.points.length;
	return new Point(sumX / numPoints, sumY / numPoints);
}

Geometry.prototype.getEnvelope = function() {
	if(this.envelope == null) {
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxX = -Number.MAX_VALUE;
		var maxY = -Number.MAX_VALUE;
		var points = this.getPoints();
        for(var i = 0; i < points.length; ++i) {
			if(minX > points[i].x) {
				minX = points[i].x;
			}
			if(minY > points[i].y) {
				minY = points[i].y;
			}
			if(maxX < points[i].x) {
				maxX = points[i].x;
			}
			if(maxY < points[i].y) {
				maxY = points[i].y;
			}
		}
		this.envelope = new Envelope(minX, minY, maxX, maxY);
	}
	return this.envelope;
}

Geometry.prototype.intersects = function(intersectingEnvelope) {
	return this.envelope.intersects(intersectingEnvelope);
}

Geometry.prototype.equals = function(geometry) {
	return false;
}

Geometry.prototype.clone = function() {
	return null;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/GeometryCollection.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function GeometryCollection(geometries) {
	this.geometries = null;
	if((geometries == null) || (geometries.length == 0)) {
    	return;
    }
    this.geometries = geometries;
	for(var i = 0; i < this.geometries.length; ++i) {
		this.geometries[i].setParent(this);
	}
}

GeometryCollection.prototype = new Geometry();

GeometryCollection.prototype.addChild = function(child) {
	if (this.isChild(child)) {
		return;
	}
	this.geometries.push(child);
	child.parent = this;
}
		
GeometryCollection.prototype.removeChild = function(child) {
	if (!this.isChild(child)) {
		return;
	}
	for (var i = 0; i < points.length; i++) {
		if (points[i] == child) {
			points.splice(i, 1);
			break;
		}
	}
	child.parent = null;
}
		
GeometryCollection.prototype.getChildGeometries = function() {
	return this.geometries;
}

GeometryCollection.prototype.clone = function() {
	var clonedGeometries = new Array();
	for(var i = 0; i < this.geometries.length; ++i) {
		clonedGeometries.push(geometries[i].clone());
	}
	return new GeometryCollection(clonedGeometries);
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Point.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Point(x, y) { 
	this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
Point.prototype.constructor = Point;

Point.prototype.getChildGeometries = function() {
	return new Array();
}

Point.prototype.getPoints = function() {
	return new Array(this);
}

Point.prototype.getEndPoint = function() {
	return this;
}

Point.prototype.getCenterPoint = function() {
	return new Point(this.x, this.y);
}

Point.prototype.getEnvelope = function() {
	return new Envelope(this.x, this.y, this.x, this.y);
}

Point.prototype.intersects = function(intersectingEnvelope) {
	if (
		(this.x >= intersectingEnvelope.minX) &&
		(this.x <= intersectingEnvelope.maxX) &&
		(this.y >= intersectingEnvelope.minY) &&
		(this.y <= intersectingEnvelope.maxY)
	) {
		return true;
	}
	return false;
}	

Point.prototype.move = function(dx, dy) {
	this.x += dx;
	this.y += dy;
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

Point.prototype.getX = function() {
	return this.x;
}

Point.prototype.getY = function() {
	return this.y;
}

Point.prototype.getDistance = function(point) {
	var dx = this.x - point.getX();
	var dy = this.y - point.getY();
	var distance = Math.sqrt((dx * dx) + (dy * dy));
	return distance;
}

Point.prototype.toString = function() {
    return "Point(" + this.x + ", " + this.y + ")";
}



/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Envelope.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Envelope(minX, minY, maxX, maxY) {
	this.point0 = new Point(minX, minY);
	this.point0.setParent(this);
	this.point1 = new Point(maxX, maxY);
	this.point1.setParent(this);
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
}

Envelope.prototype = new Geometry();
Envelope.prototype.constructor = Envelope;

Envelope.prototype.childGeometries = function() {
	return new Array(this.point0, this.point1);
}
		
Envelope.prototype.getPoints = function() {
	return new Array(this.point0, this.point1);
}
		
Envelope.prototype.getEndPoint = function() {
	return this.point1;
}
		
Envelope.prototype.getCenterPoint = function() {
	var centerX = (this.minX + this.maxX) / 2;
	var centerY = (this.minY + this.maxY) / 2;
	return new Point(centerX, centerY);
}
		
Envelope.prototype.getEnvelope = function() {
	return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}
		
Envelope.prototype.intersects = function(intersectingEnvelope) {
	if (
		(this.minX > intersectingEnvelope.maxX) ||
		(this.maxX < intersectingEnvelope.minX) ||
		(this.minY > intersectingEnvelope.maxY) ||
		(this.maxY < intersectingEnvelope.minY)
	) {
		return false;
	}
	return true;
}		

Envelope.prototype.equals = function(geometry) {
	if(!(geometry instanceof Envelope)) {
		return false;
	}
	if(
		(minX == Envelope(geometry).minX) &&
		(minY == Envelope(geometry).minY) &&
		(maxX == Envelope(geometry).maxX) &&
		(maxY == Envelope(geometry).maxY)
	) {
		return true;
	}
	return false;
}

Envelope.prototype.clone = function() {
	return new Envelope(this.minX, this.minY, this.maxX, this.maxY);
}
		
Envelope.prototype.getMinX = function(){
	if (this.point0.getX() <= this.point1.getX()) {
		return this.point0.getX();
	} else {
		return this.point1.getX();
	}
}
		
Envelope.prototype.getMinY = function() {
	if (this.point0.getY() <= this.point1.getY()) {
		return this.point0.getY();
	} else {
		return this.point1.getY();
	}
}

Envelope.prototype.getMaxX = function(){
	if (this.point0.getX() >= this.point1.getX()) {
		return this.point0.getX();
	} else {
		return this.point1.getX();
	}
}		

Envelope.prototype.getMaxY = function() {
	if (this.point0.getY() >= this.point1.getY()) {
		return this.point0.getY();
	} else {
		return this.point1.getY();
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
	var dx = width * displacementFactor;
	var dy = height * displacementFactor;
	this.point0.move(-dx, -dy);
	this.point1.move(dx, dy);
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
    this.points = null;
    if((points == null) || (points.length < 2)){
    	return;
    }
    this.points = points;
    var _points = this.getPoints();
    for(var i = 0; i < _points.length; ++i) {
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
	this.points.push(child);
	child.setParent(this);
}
		
LineString.prototype.removeChild = function(child) {
	if ((!this.isChild(child))) {
		return;
	}
	var _points = this.getPoints();
	if (_points.length == 2) {
		var otherPoint = null;
		var pointIndex = -1;
		if (child == this.points[0]) {
			otherPoint = this.points[1];
			pointIndex = 0;
		} else if (child == _points[1]) {
			otherPoint = this.points[0];
			pointIndex = 1;
		}
		_points[pointIndex] = otherPoint.clone();
		_points[pointIndex].parent = this;
	} else {
		for (var i = 0; i < _points.length; i++) {
			if (_points[i] == child) {
				_points.splice(i, 1);
				break;
			}
		}
	}
	child.setParent(null);
}
		
LineString.prototype.getChildGeometries = function() {
	return this.getPoints();
}
		
LineString.prototype.getPoints = function() {
	var copy = new Array();
    return copy.concat(this.points); 
}

LineString.prototype.clone = function() {
	var clonedPoints = new Array();
	for(var i = 0; i < this.points.length; ++i) {
		clonedPoints.push(points[i].lcone());
	}
	return new LineString(clonedPoints);
}

LineString.prototype.getLength = function() {
	var length = 0;
	var previousPoint = null;
	for(var i = 0; i < this.points.length; ++i) {
		if (this.points[i] != this.points[0]) {
			length += this.points[i].getDistance(previousPoint);
		}
		previousPoint = this.points[i];
	}
	return length;
}
	


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/Polygon.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Polygon(points){
    this.points = points;
}

Polygon.prototype = new Geometry();
Polygon.prototype.constructor = Polygon;

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/WKTConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function WKTConverter() {
	this.sridRegExp = /^"?SRID=(\d+);(.*)/;
	this.geometryCollectionRegExp = /^"?GEOMETRYCOLLECTION\((.*?)\)"?$/;
	this.pointRegExp = /^"?POINT\(([-\d\s\.]*)\)"?$/;
	this.lineStringRegExp = /^"?LINESTRING\(([-\d\s\.,]*)\)"?$/; 
	this.polygonRegExp = /^"?POLYGON\(\(([-\d\s\.,]*)\)\)"?$/;
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
	} 
	else if (wkt.search(this.pointRegExp) == 0) {
		geometry = this.wktToPoint(wkt);
	} 
	else if (wkt.search(this.lineStringRegExp) == 0) {
		geometry = this.wktToLineString(wkt);
	} 
	else if (wkt.search(this.polygonRegExp) == 0) {
		geometry = this.wktToPolygon(wkt);
	}
	if ((geometry != null) && (sridString != null) && (sridString != "") && (sridString != "900913")) {
		geometry.srid = parseInt(sridString);
		geometry = GeometryTools.prototype.transform(geometry, 900913);
	}
	return geometry;
}

WKTConverter.prototype.wktToGeometryCollection = function(wkt) {
	wkt = wkt.replace(this.geometryCollectionRegExp, "$1");
	var endOfLine = false;
	var i = -1;
	var geometries = new Array();
	while (!endOfLine) {
		i = wkt.search(new RegExp(",(POINT|LINESTRING|POLYGON)"));
		if (i > -1) {
			geometries.push(this.wktToGeometry(wkt.substring(0, i)));
			wkt = wkt.substring(i + 1);
		} 
		else {
			geometries.push(this.wktToGeometry(wkt));
			endOfLine = true;
		}
	}
	return new GeometryCollection(geometries);
}
	
WKTConverter.prototype.wktToPoint = function(wkt) {
	wkt = wkt.replace(this.pointRegExp, "$1");
	var coords = wkt.split(" ");
	return new Point(coords[0], coords[1]);
}
	
WKTConverter.prototype.wktToLineString = function(wkt) {		
	wkt = wkt.replace(this.lineStringRegExp, "$1");
	var pointStrings = wkt.split(",");
	var coords = null;
	var points = new Array();
	for(var i = 0; i < pointStrings.length; ++i) {
		coords = pointStrings[i].split(" ");
		points.push(new Point(coords[0], coords[1]));
	}
	return new LineString(points);
}

WKTConverter.prototype.wktToPolygon = function(wkt) {	
	wkt = wkt.replace(this.polygonRegExp, "$1");
	var pointStrings = wkt.split(",");
	var coords = null;
	var points = new Array();
	for(var i = 0; i < pointStrings.length; ++i) {
		coords = pointStrings[i].split(" ");
		points.push(new Point(coords[0], coords[1]));
	}
	return new Polygon(new LineString(points));
}
		
WKTConverter.prototype.geometryToWKT = function(geometry) {		
	if (geometry instanceof Point) {
		return pointToWKT(Point(geometry));
	} else if (geometry instanceof Polygon) {
		return this.polygonToWKT(Polygon(geometry));
	}
	return null;
}
	
WKTConverter.prototype.pointToWKT = function(point) {		
	return "POINT(" + point.x + " " + point.y + ")";
}

WKTConverter.prototype.polygonToWKT = function(polygon) {	
	var wkt = "POLYGON((";
	var polyPoints = polygon.points;
	for(var i = 0; i < polyPoints.length; ++i) {
		wkt += Number(polyPoints[i].x) + " " + Number(polyPoints[i].y) + ",";
	}
	wkt = wkt.substring(0, wkt.length - 1) + "))";
	return wkt;
}


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: geometrymodel/converters/SVGConverter.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function SVGConverter() {}

SVGConverter.prototype.pointsToSVGPoints = function(bounds, centerScale, points) {
    if (points == null) {
        return "";
    }
    
    var svgPoints = "";
    for (var i = 0; i < points.length; i++) {
        var x = centerScale.getPixX(bounds.width, points[i].x);
        var y = centerScale.getPixY(bounds.height, points[i].y);
        svgPoints += x + "," + y + " ";
    }
    return svgPoints;
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


function PropertyType() {}

PropertyType.prototype.BOOLEAN = "boolean";
PropertyType.prototype.DOUBLE = "double";
PropertyType.prototype.INTEGER = "integer";
PropertyType.prototype.STRING = "string";
PropertyType.prototype.GEOMETRY = "geometry";

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


function CSVConverter() {}

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

CenterScale.prototype.toEnvelope = function(width, height) {
    var numHorzCoords = width * this.coordPixFactor * this.scale;
    var numVertCoords = height * this.coordPixFactor * this.scale;
    var minX = this.centerX - numHorzCoords / 2;
    var minY = this.centerY - numVertCoords / 2;
    var maxX = minX + numHorzCoords;
    var maxY = minY + numVertCoords;
    return new Envelope(minX, minY, maxX, maxY);
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
    this.animationTimer = new Timer(50, 20);
    this.incubationTimer = new Timer(1000, 1);
    this.maxEnvelope = new Envelope(-20000000, -20000000, 20000000, 20000000);
    this.minScale = 0;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animationCenterScales = [];
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
}

FocusModel.prototype.bazoo = function(x, y, pixXOffset, pixYOffset) {
    if (!this.animationTimer.isRunning() && !this.incubationTimer.isRunning()) {
        return;
    }
    
    var cs = null;
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScales[this.animationTimer.currentCount].scale == this.centerScale.scale) {
            this.animationTimer.reset();
            animationCenterScales = [];
            cs = this.animationCenterScale;
        } else {
            var scale = this.centerScale.scale;
            var centerX = x - (pixXOffset * 0.000352778 * scale);
            var centerY = y + (pixYOffset * 0.000352778 * scale);
            cs = this.centercon(new CenterScale(centerX, centerY, scale));
            this.setAnimationCenterScales(cs);
        }
        this.centerScale = cs;
    } else {  // incubationTimer.isRunning()
        cs = this.centerScale;  // == animationCenterScale
    }
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.pan = function(dx, dy) {
    var cs = null;
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScales[this.animationTimer.currentCount].scale == this.centerScale.scale) {
            this.animationTimer.reset();
            animationCenterScales = [];
            cs = this.centercon(new CenterScale(this.animationCenterScale.centerX + dx, this.animationCenterScale.centerY + dy, this.animationCenterScale.scale));
            this.animationCenterScale = cs;
        } else {
            cs = this.centercon(new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale));
            this.setAnimationCenterScales(cs);
        }
    } else {
        cs = this.centercon(new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale));
        this.animationCenterScale = cs;
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.sawoo = function(cs, pixXOffset, pixYOffset, animate) {
    cs = this.scalecon(cs, animate);
    var scale = cs.scale;
    var centerX = cs.centerX - (pixXOffset * 0.000352778 * scale);
    var centerY = cs.centerY + (pixYOffset * 0.000352778 * scale);
    cs = this.centercon(new CenterScale(centerX, centerY, scale));
    
    if (animate) {
        this.setAnimationCenterScale(cs);
    } else {
        if (this.animationTimer.isRunning()) {
            this.animationTimer.reset();
            animationCenterScales = [];
        }
        this.animationCenterScale = cs;
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.setCenterScale = function(centerScale, scaleToZoomLevels) {
    if (centerScale == null) {
        return;
    }
    if (scaleToZoomLevels === undefined) {
        scaleToZoomLevels = true;
    }
    
    centerScale = this.centercon(this.scalecon(centerScale, scaleToZoomLevels));
    if (this.centerScale == null) {
        this.centerScale = centerScale;
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.setAnimationCenterScale(centerScale);
    this.setIncubationCenterScale(centerScale);
}

FocusModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationTimer.reset();
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        focusModel.animationCenterScale = focusModel.animationCenterScales[focusModel.animationTimer.currentCount];
    };
    
    this.setAnimationCenterScales(animationCenterScale);
    this.animationCenterScale = this.animationCenterScales[0];
    
    this.animationTimer.start();
}

FocusModel.prototype.setIncubationCenterScale = function(incubationCenterScale) {
    this.incubationTimer.reset();
    var focusModel = this;
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = incubationCenterScale;
    };
    
    this.incubationTimer.start();
}

FocusModel.prototype.setAnimationCenterScales = function(centerScale) {
    var animationCenterScales = new Array(this.animationTimer.numRepeats + 1);
    var numRemaining = this.animationTimer.numRepeats - this.animationTimer.currentCount;
    var dCenterX = (centerScale.centerX - this.animationCenterScale.centerX) / numRemaining;
    var dCenterY = (centerScale.centerY - this.animationCenterScale.centerY) / numRemaining;
    var dScale = (centerScale.scale - this.animationCenterScale.scale) / numRemaining;
    var m = -1;
    
    for (var i = this.animationTimer.currentCount; i < this.animationTimer.numRepeats; i++) {
        m = i - this.animationTimer.currentCount;
        animationCenterScales[i] = new CenterScale(
            this.animationCenterScale.centerX + (-dCenterX / numRemaining * m * m + 2 * dCenterX * m),
            this.animationCenterScale.centerY + (-dCenterY / numRemaining * m * m + 2 * dCenterY * m),
            this.animationCenterScale.scale + (-dScale / numRemaining * m * m + 2 * dScale * m)
        );
    }
    animationCenterScales[this.animationTimer.numRepeats] = centerScale;
    
    this.animationCenterScales = animationCenterScales;
}

// Center-related conditions. Relevant for zooming and panning.
FocusModel.prototype.centercon = function(centerScale) {
    if (centerScale.centerX < this.maxEnvelope.minX) {
        return this.centercon(new CenterScale(this.maxEnvelope.minX, centerScale.centerY, centerScale.scale));
    }
    if (centerScale.centerX > this.maxEnvelope.maxX) {
        return this.centercon(new CenterScale(this.maxEnvelope.maxX, centerScale.centerY, centerScale.scale));
    }
    if (centerScale.centerY < this.maxEnvelope.minY) {
        return this.centercon(new CenterScale(centerScale.centerX, this.maxEnvelope.minY, centerScale.scale));
    }
    if (centerScale.centerY > this.maxEnvelope.maxY) {
        return this.centercon(new CenterScale(centerScale.centerX, this.maxEnvelope.maxY, centerScale.scale));
    }
    return centerScale;
}

// Scale-related conditions. Relevant for zooming only.
FocusModel.prototype.scalecon = function(centerScale, scaleToZoomLevels) {
    if (centerScale.scale < this.minScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale), scaleToZoomLevels);
    }
    if (centerScale.scale > this.maxScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale), scaleToZoomLevels);
    }
    if (scaleToZoomLevels && this.scaleToZoomLevels) {
        var zoomLevelScale = getZoomLevel(centerScale.scale, true).scale;
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
    var zoomLevel = null;
    for (var i = 0; i < zoomLevels.length - 1; i++) {
        zoomLevel = zoomLevels[i];
        if (!round) {
            if (scale >= zoomLevel.scale) {
                return zoomLevel;
            }
        } else {
            if (scale >= (zoomLevel.scale + zoomLevels[i + 1].scale) / 2) {
                return zoomLevel;
            }
        }
    }
    return zoomLevels[zoomLevels.length - 1];
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


function Tile(tileX, tileY, scale, tileWidth, tileHeight, url) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.scale = scale;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.url = url;
    this.x = 0;
    this.y = 0;
    this.scaling = 1;
    this.completed = false;
}

Tile.prototype.reset = function(bounds, centerScale, minX, maxY) {
    this.x = centerScale.getPixX(bounds.width, minX);
    this.y = centerScale.getPixY(bounds.height, maxY);
    this.scaling = this.scale / centerScale.scale;
}

Tile.prototype.resetWithEnvelope = function(bounds, centerScale, envelope) {
    var minPixX = centerScale.getPixX(bounds.width, envelope.minX);
    var minPixY = centerScale.getPixY(bounds.height, envelope.maxY);
    var maxPixX = centerScale.getPixX(bounds.width, envelope.maxX);
    var maxPixY = centerScale.getPixY(bounds.height, envelope.minY);
    
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
    this.http = null;
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.minX = -20037508.3427892;
    this.maxY = 20037508.3427892;
    this.tiles = [];
}

TileModel.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
        return;
    }
    
    this.bounds = bounds;
    this.resetLoaders();
}

TileModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.resetLoaders();
}

TileModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var tileZ = zoomLevel.zoomLevel;
    var tileLimit = Math.pow(2, tileZ);
    var leftTileX = Math.floor((envelope.minX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].completed = false;
    }
    
    var minX = -1;
    var maxY = -1;
    var url = null;
    var tile = null;
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            minX = tileX * this.tileWidth * zoomLevel.resolution + this.minX;
            maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.maxY);
            
            tile = this.getTile(tileX, tileY, zoomLevel.scale);
            if (tile == null) {
                url = this.layer.urlExtension;
                url = url.replace("$Z", tileZ);
                url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                url = url.replace("$Y", tileY);
                
                tile = new Tile(tileX, tileY, zoomLevel.scale, this.tileWidth, this.tileHeight, this.layer.baseURL + url);
                this.tiles.push(tile);

                if (this.http) {
                    var f = function(t) {
                        return function(data, status, headers, config) {
                            t.utfGrid = eval(data);
                        }
                    }(tile);
                    this.http({ method: "GET", url: tile.url, cache: true }).success(f);
                }
            }
            
            tile.reset(this.bounds, this.centerScale, minX, maxY);
            tile.completed = true;
        }
    }
}

TileModel.prototype.getTile = function(x, y, scale) {
    var tile = null;
    for (var i = 0; i < this.tiles.length; i++) {
        tile = this.tiles[i];
        if ((tile.tileX == x) && (tile.tileY == y) && (tile.scale == scale)) {
            return tile;
        }
    }
    return null;
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
    var minX = envelope.minX;
    var minY = envelope.minY;
    var maxX = envelope.maxX;
    var maxY = envelope.maxY;
    
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
        sldURL += "?layer=" + this.layer.name;
        
        var filterModels = this.layer.filterModels;
        var urlFilter = URLFilterConverter.filterModelsToURLFilter(filterModels);
        if (urlFilter.length > 0) {
            sldURL += "&filter=" + urlFilter;
        }
        
        var classification = this.layer.classification;
        if (classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(classification));
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
        this.tile = new Tile(minX, maxY, this.centerScale.scale, tileWidth, tileHeight, url);
    }
    this.tile.reset(this.bounds, this.animationCenterScale, minX, maxY);
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
    
    this.tile.reset(this.bounds, this.animationCenterScale, this.tile.tileX, this.tile.tileY);
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
    factory("defaultTilesLayer", function() {
        return new Layer("Tiles");
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
    directive("map", ["$document", "defaultBoundsModel", "defaultFocusModel", "defaultEnvelopeModel", function($document, defaultBoundsModel, defaultFocusModel, defaultEnvelopeModel) {
        return {
            template: '<div ng-transclude msd-wheel="mouseWheelHandler($event, $delta, $deltaX, $deltaY)" class="mapviewer"></div>',
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=?boundsmodel",
                focusModel: "=?focusmodel",
                envelopeModel: "=?envelopemodel",
                mouseWheelAction: "@mousewheelaction"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            link: function($scope, $element, $attr) {
                $scope.$watch("boundsModel", function(val) {
                    if (val == null) {
                        $scope.boundsModel = defaultBoundsModel;
                    } else {
                        var resizeTimer = new Timer(2000, -1);
                        resizeTimer.scope = $scope;
                        resizeTimer.timerHandler = function() {
                            val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        };
                        resizeTimer.timerHandler.apply();
                        resizeTimer.start();
                    }
                });
                $scope.$watch("focusModel", function(val) {
                    if (val == null) {
                        $scope.focusModel = defaultFocusModel;
                    }
                });
                $scope.$watch("envelopeModel", function(val) {
                    if (val == null) {
                        $scope.envelopeModel = defaultEnvelopeModel;
                    } else {
                        $scope.$watch("boundsModel.bounds", function(val1) {
                            val.setBounds(val1);
                        });
                        $scope.$watch("focusModel.animationCenterScale", function(val1) {
                            val.setCenterScale(val1);
                        });
                    }
                });
                
                var mouseWheelTime = (new Date()).getTime();
                var mouseWheelDelta = -1;
                
                $scope.mouseWheelHandler = function(mouseEvent, delta, deltaX, deltaY) {
                    mouseEvent.preventDefault();
                    
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    
                    if ($scope.mouseWheelAction == "HORIZONTAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX - cs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX + cs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        }
                    } else if ($scope.mouseWheelAction == "VERTICAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY + cs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY - cs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        }
                    } else {  // ZOOM
                        var now = (new Date()).getTime();
                        if ((now - mouseWheelTime > 250) || (mouseWheelDelta * delta < 0)) {
                            var mouseX = mouseEvent.originalEvent.clientX - $element[0].getBoundingClientRect().left;
                            var mouseY = mouseEvent.originalEvent.clientY - $element[0].getBoundingClientRect().top;
                            
                            var worldX = cs.getWorldX(width, mouseX);
                            var worldY = cs.getWorldY(height, mouseY);
                            var scale = cs.scale;
                            
                            if (delta > 0) {
                                scale /= 2;
                            } else {
                                scale *= 2;
                            }
                            var pixXOffset = mouseX - (width / 2);
                            var pixYOffset = mouseY - (height / 2);
                            
                            $scope.focusModel.sawoo(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, true);
                        }
                        
                        mouseWheelTime = now;
                        mouseWheelDelta = delta;
                    }
                };
                
                $element.on("mousedown", pressHandler);
                $element.on("touchstart", pressHandler);
                
                var panTimer = new PanSpeedTimer(50, -1); // Role of timer is 2-fold: measure pan speed, but also apply digest cycle every tick.
                panTimer.scope = $scope;
                
                function pressHandler(event) {
                    if (panTimer.isRunning()) {  // From 1 to 2 fingers is not a true press anymore.
                        return;
                    }
                    
                    event.preventDefault();
                    decorateTouchEvent(event, false);
                    
                    var pressX = event.clientX - $element[0].getBoundingClientRect().left;
                    var pressY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, pressX);
                    var worldY = cs.getWorldY(height, pressY);
                    
                    var pixXOffset = pressX - (width / 2);
                    var pixYOffset = pressY - (height / 2);
                    
                    $scope.focusModel.bazoo(worldX, worldY, pixXOffset, pixYOffset);
                    
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
                };
                
                function mouseMoveHandler(mouseEvent) {
                    mouseEvent.preventDefault();
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var dx = cs.getNumWorldCoords(mouseEvent.clientX - panTimer.panEvent.clientX);
                    var dy = cs.getNumWorldCoords(mouseEvent.clientY - panTimer.panEvent.clientY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    panTimer.panEvent = mouseEvent;
                }
                
                function touchMoveHandler(touchEvent) {
                    touchEvent.preventDefault();
                    decorateTouchEvent(touchEvent, false);
                    
                    if (touchEvent.touches.length == panTimer.panEvent.touches.length) {
                        var pinchX = touchEvent.clientX - $element[0].getBoundingClientRect().left;
                        var pinchY = touchEvent.clientY - $element[0].getBoundingClientRect().top;
                        
                        var bounds = $scope.boundsModel.bounds;
                        var width = bounds.width;
                        var height = bounds.height;
                        
                        var cs = $scope.focusModel.animationCenterScale;
                        var worldX = cs.getWorldX(width, pinchX);
                        var worldY = cs.getWorldY(height, pinchY);
                        var scale = cs.scale / (touchEvent.radius / panTimer.panEvent.radius);
                        
                        var pixXOffset = pinchX + (touchEvent.clientX - panTimer.panEvent.clientX) - (width / 2);
                        var pixYOffset = pinchY + (touchEvent.clientY - panTimer.panEvent.clientY) - (height / 2);
                        
                        $scope.focusModel.sawoo(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, false);
                    }
                    
                    panTimer.panEvent = touchEvent;
                }
                
                function releaseHandler(event) {
                    if ((event.touches != null) && (event.touches.length > 0)) {  // From 2 to 1 fingers is not a true release yet.
                        return;
                    }
                    
                    var speed = panTimer.resetAndGetSpeed();
                    if ((speed.h == 0) || (speed.v == 0)) {
                        panTimer.tick();
                    } else {
                        var cs = $scope.focusModel.animationCenterScale;
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
                    }
                    
                    panTimer.panEvent = null;
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
                
                $scope.$watch("layer", function(val) { $scope.tile = new Tile(1, 1, 1, val.tileWidth, undefined, val.baseURL); resetTile(); });
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
            template: '<div class="tileslayer"><div ng-if="tileModel.layer.visible" class="tileslayer"><img ng-repeat="tile in tileModel.tiles | filter: {completed: true}" ng-src="{{tile.url}}" style="position: absolute" ng-style="tile.toCSS()"/><div class="tileslayer"></div></div></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.tileModel.layer = (val || defaultTilesLayer); });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
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
                
                $scope.$watch("layer", function(val) { $scope.wmsModel.layer = val; $scope.wmsModel.load(); });
                $scope.$watchCollection("layer.filterModels", function(val) { $scope.wmsModel.load(); });
                $scope.$watch("layer.vendorSpecifics", function(val) { $scope.wmsModel.load(); }, true);
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
                featureCommands: "=featurecommands"
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
    directive("geometrysymbolizer", function() {
        return {
            template: '<div class="mapfeaturelayer"><div ng-if="maxScale >= focusModel.animationCenterScale.scale" class="mapfeaturelayer"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" ng-repeat="feature in featureModel.features" class="mapfeature"><polyline ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:intersectsEnvelope" points="{{toSVGPoints(boundsModel.bounds, focusModel.animationCenterScale, geometry.points)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapgeometry\' + \' \' + highClass: \'mapgeometry\'"/></svg></div></div>',
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
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.envelope);
                };
                $scope.toSVGPoints = (new SVGConverter()).pointsToSVGPoints;
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
            }
        };
    }).
    directive("imagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in featureModel.features | filter:intersectsEnvelope" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(feature.propertyValues[propertyIndex])"/></div></div>',
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
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
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
    }).
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
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
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

