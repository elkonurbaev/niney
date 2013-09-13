function TileModel() {
    this.bounds = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.urlBase = "http://www.waterfootprintassessmenttool.org/tiles/example/";
    this.urlExtension = "$Z/$X/$Y.png";
    this.maxX = 20037508.3427892;
    this.maxY = 20037508.3427892;
    this.tileZ = -1;
    this.tiles = [];
}

TileModel.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
        return;
    }
    
    this.bounds = bounds;
    
    this.resetLoaders();
}

TileModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.resetLoaders();
}

TileModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var tileZ = zoomLevel.zoomLevel;
    var tileScale = zoomLevel.scale;
    var resolution = zoomLevel.resolution;
    var tileLimit = Math.pow(2, tileZ);
    var leftTileX = Math.floor((envelope.minX + this.maxX) / resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.maxY) / resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX + this.maxX) / resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.minY) / resolution / this.tileHeight), tileLimit - 1);
    
    if (this.tileZ != tileZ) {
        this.tileZ = tileZ;
        this.tiles = [];
    }
    
    var minX = -1;
    var maxY = -1;
    var url = null;
    var dX = -1;
    var dY = -1;
    var scaling = 1;
    var tile = null;
    
    var i = 0;
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            minX = tileX * this.tileWidth * resolution - this.maxX;
            maxY = -(tileY * this.tileHeight * resolution - this.maxY);
            
            url = this.urlExtension;
            url = url.replace("$Z", tileZ);
            url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
            url = url.replace("$Y", tileY);
            
            dX = this.centerScale.getPixX(this.bounds.width, minX);
            dY = this.centerScale.getPixY(this.bounds.height, maxY);
            scaling = tileScale / this.centerScale.scale;
            var wi = this.tileWidth * scaling;
            var he = this.tileHeight * scaling;
            
            while (
                    (i < this.tiles.length) &&
                    ((this.tiles[i].tileY < tileY) || ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX < tileX)))
            ) {
                this.tiles.splice(i, 1);
            }
            
            tile = null;
            if (i >= this.tiles.length) {
                this.tiles.push(new Tile(tileX, tileY, url, dX, dY, wi, he));
            } else if ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX == tileX)) {
                tile = this.tiles[i];
                tile.x = dX;
                tile.y = dY;
                tile.width = wi;
                tile.height = he;
            } else {
                this.tiles.splice(i, 0, new Tile(tileX, tileY, url, dX, dY, wi, he));
            }
            i++;
        }
    }
    this.tiles.splice(i, this.tiles.length - i);
}

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