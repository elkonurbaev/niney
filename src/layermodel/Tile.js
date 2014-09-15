function Tile(tileX, tileY, url, x, y, width, height) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.url = url;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Tile.prototype.toCSS = function() {
    return {top: this.y + "px", left: this.x + "px", width: this.width + "px", height: this.height + "px"};
}