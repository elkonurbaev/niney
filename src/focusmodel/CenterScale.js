export function CenterScale(centerX, centerY, scale, yFactor) {
    this.coordPixFactor = 0.000352778;
    
    this.centerX = centerX;
    this.centerY = centerY;
    this.scale = scale;
    
    this.yFactor = (yFactor == null)? -1: yFactor;
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
    return new CenterScale(this.centerX, this.centerY, this.scale, this.yFactor);
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
    return new CenterScale(this.centerX + pixXOffset * a, this.centerY + pixYOffset * a * this.yFactor, this.scale);
}

CenterScale.prototype.fromOffset = function(pixXOffset, pixYOffset) {
    var a = this.coordPixFactor * this.scale;
    return new CenterScale(this.centerX - pixXOffset * a, this.centerY - pixYOffset * a * this.yFactor, this.scale);
}

CenterScale.prototype.getNumWorldCoords = function(numPixs) {
    return numPixs * this.coordPixFactor * this.scale;
}

CenterScale.prototype.getWorldX = function(width, pixX) {
    pixX = pixX - (width / 2);
    var worldX = this.centerX + pixX * this.coordPixFactor * this.scale;
    return worldX;
}

CenterScale.prototype.getWorldY = function(height, pixY) {
    pixY = pixY - (height / 2);
    var worldY = this.centerY + pixY * this.coordPixFactor * this.scale * this.yFactor;
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
    var pixY = (worldY - this.centerY) / (this.coordPixFactor * this.scale) * this.yFactor;
    pixY = pixY + (height / 2);
    return pixY;
}

CenterScale.prototype.toString = function() {
    return "CenterScale(" + this.centerX + ", " + this.centerY + ", " + this.scale + ")";
}

