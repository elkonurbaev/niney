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
