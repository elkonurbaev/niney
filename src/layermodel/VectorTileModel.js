export function VectorTileModel() {
    this.bounds = null;
    this.srs = null;
    this.maxZoomLevel = null;
    this.maxEnvelope = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.envelope = null;
    this.animationEnvelope = null;
    this.layer = null;
    this.loader = null;
    this.protocol = "MVT";
    this.numResetRuns = 2;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
    
    this.snoopMargin = 32;
}

VectorTileModel.prototype = new TileModel();
VectorTileModel.prototype.constructor = VectorTileModel;

VectorTileModel.prototype.createTile = function(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
    return new VectorTile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url);
}

VectorTileModel.prototype.tileNeedsReload = function(tile) { }  // Set by component;

VectorTileModel.prototype.loadTileData = function(tile) { }  // Set by component;

VectorTileModel.prototype.drawTileImage = function(tile, dx, dy, dWidth, dHeight, run) {
    if (run == 0) {
        this.ctx.drawImage(tile.data, dx, dy, dWidth, dHeight);
    } else if (tile.snoopData != null) {
        var scaledSnoopMargin = Math.round(tile.scaling * this.snoopMargin);
        this.ctx.drawImage(
            tile.snoopData,
            0, 0,
            tile.tileWidth + 2 * this.snoopMargin, tile.tileHeight + 2 * this.snoopMargin,
            dx - scaledSnoopMargin, dy - scaledSnoopMargin,
            dWidth + 2 * scaledSnoopMargin, dHeight + 2 * scaledSnoopMargin
        );
    }
}

VectorTileModel.prototype.drawTilePartly = function(tile, x, y, width, height) {
    this.ctx.drawImage(
        tile.data,
        x, y,
        width, height,
        Math.round(tile.x), Math.round(tile.y),
        Math.ceil(tile.scaling * width), Math.ceil(tile.scaling * height)
    );
    if (tile.snoopData != null) {
        this.ctx.drawImage(
            tile.snoopData,
            x + this.snoopMargin, y + this.snoopMargin,
            width, height,
            Math.round(tile.x), Math.round(tile.y),
            Math.ceil(tile.scaling * width), Math.ceil(tile.scaling * height)
        );
    }
}

