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
