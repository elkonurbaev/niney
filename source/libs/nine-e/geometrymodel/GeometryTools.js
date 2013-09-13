function GeometryTools(){ }

GeometryTools.prototype.transform = function(geometry, srid){
	if (geometry == null) {
		alert("No geometry given.");
	}
	if (!(geometry instanceof Point)) {
		alert("The given geometry is not a point. Only point geometries are currently supported.");
	}
	var point = geometry;
			
	if ((point.srid == 4326) && (srid == 900913)) {
		var x = point.x * 20037508.3427892 / 180;
		var y = Math.log(Math.tan((90 + point.y) * Math.PI / 360)) * 180 / Math.PI;
		y = y * 20037508.3427892 / 180;
		point = new Point(x, y);
		point.srid = srid;
		return point;
	}
	alert("The given srid transformation is currently not supported.");
} 