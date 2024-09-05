export function VectorTile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
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
    this.data = null;
    
    this.vectorData = [];
    this.extent = 4096;
    this.symbology = null;
}

VectorTile.prototype = new Tile();
VectorTile.prototype.constructor = VectorTile;

