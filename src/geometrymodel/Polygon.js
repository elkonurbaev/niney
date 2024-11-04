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
    for (var i = 0; i < this.childGeometries.length; i++) {
        clonedLineStrings.push(this.childGeometries[i].clone());
    }
    return new Polygon(clonedLineStrings);
}

Polygon.prototype.getLength = function() {
    return this.childGeometries[0].getLength();
}

Polygon.prototype.getArea = function() {
    return this.childGeometries[0].getArea();
}

Polygon.prototype.getLabelPoint = function(numSlices) {
    var horizontalScanLines = [];
    var envelope = this.getEnvelope();
    for (var i = 0; i < numSlices; i++) {
        var y = envelope.minY + envelope.getHeight() / (numSlices + 1) * (i + 1);
        horizontalScanLines.push(this.getHorizontalScanLine(y));
        horizontalScanLines[i].malusFactor = 1 - 0.2 / (numSlices - 1) * Math.abs((numSlices - 1) / 2 - i);
    }
    var horizontalScanLine = horizontalScanLines.sort(function(a, b) { return b.distance * b.malusFactor - a.distance * a.malusFactor; })[0];
    var pointX = (horizontalScanLine.x0 + horizontalScanLine.x1) / 2;
    var pointY = horizontalScanLine.y;
    var verticalScanLine = this.getVerticalScanLine(pointX, pointY);
    var marginFactor = 0.3;
    var marginMinY = verticalScanLine.y0 + marginFactor * (verticalScanLine.y1 - verticalScanLine.y0);
    var marginMaxY = verticalScanLine.y1 - marginFactor * (verticalScanLine.y1 - verticalScanLine.y0);
    if (pointY <= marginMinY) {
        return new Point(pointX, marginMinY);
    }
    if (pointY >= marginMaxY) {
        return new Point(pointX, marginMaxY);
    }
    return new Point(pointX, pointY);
}

Polygon.prototype.getHorizontalScanLine = function(y) {
    var points = this.getPoints();
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        if (points[i - 1].y == points[i].y) {
            continue;  // Skip horizontal segments;
        }
        segments.push([points[i - 1], points[i]]);
    }
    
    var selectedSegments = [];
    for (var j = 0; j < segments.length; j++) {
        var segment = segments[j];
        var minY = Math.min(segment[0].y, segment[1].y);
        var maxY = Math.max(segment[0].y, segment[1].y);
        var nextSegment = (j < segments.length - 1)? segments[j + 1]: segments[0];
        var nextMinY = Math.min(nextSegment[0].y, nextSegment[1].y);
        var nextMaxY = Math.max(nextSegment[0].y, nextSegment[1].y);
        if ((y < minY) || (y > maxY)) {
            continue;  // No intersection, so skip current segment.
        }
        if (((y == minY) && (y == nextMaxY)) || ((y == maxY) && (y == nextMinY))) {
            continue;  // Treat current and next segment as one, so skip current segment.
        }
        if (((y == minY) && (y == nextMinY)) || ((y == maxY) && (y == nextMaxY))) {
            if (j < segments.length - 1) {
                j++;                            // Skip both current and next segment;
                continue;
            } else {
                selectedSegments.splice(0, 1);  // Skip last segment and remove first segment;
                break;
            }
        }
        selectedSegments.push({
            x: (y - segment[0].y) / (segment[1].y - segment[0].y) * (segment[1].x - segment[0].x) + segment[0].x,
            segment: segment
        });
    }
    selectedSegments.sort(function(a, b) { return a.x - b.x; });
    
    var scanLines = [];
    for (var k = 0; k < selectedSegments.length; k = k + 2) {
        scanLines.push({
            x0: selectedSegments[k].x,
            x1: selectedSegments[k + 1].x,
            y: y,
            distance: selectedSegments[k + 1].x - selectedSegments[k].x
        });
    }
    return scanLines.sort(function(a, b) { return b.distance - a.distance; })[0];  // Returns the longest scanline.
}

Polygon.prototype.getVerticalScanLine = function(x, y) {
    var points = this.getPoints();
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        if (points[i - 1].x == points[i].x) {
            continue;  // Skip vertical segments;
        }
        segments.push([points[i - 1], points[i]]);
    }
    
    var selectedSegments = [];
    for (var j = 0; j < segments.length; j++) {
        var segment = segments[j];
        var minX = Math.min(segment[0].x, segment[1].x);
        var maxX = Math.max(segment[0].x, segment[1].x);
        var nextSegment = (j < segments.length - 1)? segments[j + 1]: segments[0];
        var nextMinX = Math.min(nextSegment[0].x, nextSegment[1].x);
        var nextMaxX = Math.max(nextSegment[0].x, nextSegment[1].x);
        if ((x < minX) || (x > maxX)) {
            continue;  // No intersection, so skip current segment.
        }
        if (((x == minX) && (x == nextMaxX)) || ((x == maxX) && (x == nextMinX))) {
            continue;  // Treat current and next segment as one, so skip current segment.
        }
        if (((x == minX) && (x == nextMinX)) || ((x == maxX) && (x == nextMaxX))) {
            if (j < segments.length - 1) {
                j++;                            // Skip both current and next segment;
                continue;
            } else {
                selectedSegments.splice(0, 1);  // Skip last segment and remove first segment;
                break;
            }
        }
        selectedSegments.push({
            y: (x - segment[0].x) / (segment[1].x - segment[0].x) * (segment[1].y - segment[0].y) + segment[0].y,
            segment: segment
        });
    }
    selectedSegments.sort(function(a, b) { return a.y - b.y; });
    
    for (var k = 0; k < selectedSegments.length; k = k + 2) {
        if ((y >= selectedSegments[k].y) && (y <= selectedSegments[k + 1].y)) {  // Returns the scanline that matches the given y.
            return {
                x: x,
                y0: selectedSegments[k].y,
                y1: selectedSegments[k + 1].y,
                distance: selectedSegments[k + 1].y - selectedSegments[k].y
            };
        }
    }
}

