function TileModel() {
    this.http = null;
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.minX = -20037508.3427892;
    this.maxY = 20037508.3427892;
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
    var tileLimit = Math.pow(2, tileZ);
    var leftTileX = Math.floor((envelope.minX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].completed = false;
    }
    
    var minX = -1;
    var maxY = -1;
    var url = null;
    var tile = null;
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            minX = tileX * this.tileWidth * zoomLevel.resolution + this.minX;
            maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.maxY);
            
            tile = this.getTile(tileX, tileY, zoomLevel.scale);
            if (tile == null) {
                url = this.layer.urlExtension;
                url = url.replace("$Z", tileZ);
                url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                url = url.replace("$Y", tileY);
                
                tile = new Tile(tileX, tileY, zoomLevel.scale, this.tileWidth, this.tileHeight, this.layer.baseURL + url);
                this.tiles.push(tile);

                if (this.http) {
                    var f = function(t) {
                        return function(data, status, headers, config) {
                            t.utfGrid = eval(data);
                        }
                    }(tile);
                    this.http({ method: "GET", url: tile.url, cache: true }).success(f);
                }
            }
            
            tile.reset(this.bounds, this.centerScale, minX, maxY);
            tile.completed = true;
        }
    }
}

TileModel.prototype.getTile = function(x, y, scale) {
    var tile = null;
    for (var i = 0; i < this.tiles.length; i++) {
        tile = this.tiles[i];
        if ((tile.tileX == x) && (tile.tileY == y) && (tile.scale == scale)) {
            return tile;
        }
    }
    return null;
}

