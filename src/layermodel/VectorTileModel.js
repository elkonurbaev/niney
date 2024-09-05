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
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
}

VectorTileModel.prototype = new TileModel();
VectorTileModel.prototype.constructor = VectorTileModel;

VectorTileModel.prototype.createTile = function(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
    return new VectorTile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url);
}

VectorTileModel.prototype.tileNeedsReload = function(tile) { }  // Set by component;

VectorTileModel.prototype.loadTileData = function(tile) { }  // Set by component;

