function Tile(tileX, tileY, tileWidth, tileHeight, url, x, y, scaling) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.url = url;
    this.x = x;
    this.y = y;
    this.scaling = scaling;
    this.scale = -1;
    this.completed = false;
}

Tile.prototype.toCSS = function() {
    return {left: this.x + "px", top: this.y + "px", width: (this.tileWidth * this.scaling) + "px", height: (this.tileHeight * this.scaling) + "px"};
}

