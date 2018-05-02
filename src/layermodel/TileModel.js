function TileModel() {
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.minX = -285401.92;
    this.maxY = 903401.9199999999;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
    this.http = null;  // Used only for UTFGrid tile models.
}

TileModel.prototype.setBounds = function(bounds) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.resetLoaders();
}

TileModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.resetLoaders();
}

TileModel.prototype.setLayer = function(layer) {
    this.layer = layer;
    this.tiles = [];
    this.tileIndex = {};
    this.resetLoaders();
}

TileModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if ((this.layer == null) || !this.layer.visible) {
        return;
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    } else {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].completed = false;
        }
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.getMinX() - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.getMaxY()) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.getMaxX() - this.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.getMinY()) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if ((tile == null) || (!tile.completed)) {
                var minX = tileX * this.tileWidth * zoomLevel.resolution + this.minX;
                var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.maxY);
                
                if (this.ctx != null) {
                    this.drawTilesAroundZoomLevel(zoomLevel.zoomLevel, minX, maxY);
                }
                
                if (tile == null) {
                    var url = this.layer.urlExtension;
                    url = url.replace("$Z", zoomLevel.zoomLevel);
                    url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                    url = url.replace("$Y", tileY);
                    
                    tile = new Tile(minX, maxY, zoomLevel.scale, tileX, tileY, this.tileWidth, this.tileHeight, this.layer.baseURL + url);
                    this.addTile(zoomLevel.zoomLevel, tile);
                    
                    if (this.ctx != null) {
                        var e = function(t, env) {
                            return function() {
                                t.completed = true;
                                if (getZoomLevel(env.centerScale.scale) == getZoomLevel(t.scale)) {
                                    t.reset(env.bounds, env.centerScale);
                                    env.drawTile(t);
                                }
                            }
                        }(tile, this);
                        tile.data = new Image();
                        tile.data.addEventListener("load", e);
                        tile.data.src = tile.url;
                    }
                    
                    if (this.http != null) {
                        var f = function(t) {
                            return function(data, status, headers, config) {
                                t.utfGrid = eval(data);
                            }
                        }(tile);
                        this.http({ method: "GET", url: tile.url, cache: true }).success(f);
                    }
                }
                
                if (this.ctx == null) {
                    tile.reset(this.bounds, this.centerScale);
                    tile.completed = true;
                }
            } else {  // Completed tile exists. Only applies to tile models that draw on a canvas (ctx).
                tile.reset(this.bounds, this.centerScale);
                this.drawTile(tile);
            }
        }
    }
}

TileModel.prototype.addTile = function(zoomLevel, tile) {
    if (this.tileIndex[zoomLevel] == null) {
        this.tileIndex[zoomLevel] = {};
    }
    if (this.tileIndex[zoomLevel][tile.tileX] == null) {
        this.tileIndex[zoomLevel][tile.tileX] = {};
    }
    this.tileIndex[zoomLevel][tile.tileX][tile.tileY] = this.tiles.push(tile) - 1;
}

TileModel.prototype.getTile = function(zoomLevel, tileX, tileY) {
    if ((this.tileIndex[zoomLevel] == null) || (this.tileIndex[zoomLevel][tileX] == null) || (this.tileIndex[zoomLevel][tileX][tileY] == null)) {
        return null;
    }
    
    return this.tiles[this.tileIndex[zoomLevel][tileX][tileY]];
}

TileModel.prototype.drawTilesAroundZoomLevel = function(zl, minX, maxY) {
    // Find any completed tile in the zoom levels above the given zoom level.
    for (var i = zl - 1; i >= 0; i--) {
        var zoomLevel = zoomLevels[i];
        var zoomFactor = Math.pow(2, zl - i);
        var subTileX = Math.round((minX - this.minX) / zoomLevel.resolution / this.tileWidth * zoomFactor) / zoomFactor;
        var tileX = Math.floor(subTileX);
        var subTileY = Math.round((this.maxY - maxY) / zoomLevel.resolution / this.tileHeight * zoomFactor) / zoomFactor;
        var tileY = Math.max(Math.floor(subTileY), 0);
        var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
        if ((tile != null) && (tile.completed)) {
            tile.resetWithPoint(this.bounds, this.centerScale, minX, maxY);
            this.ctx.drawImage(
                tile.data,
                (subTileX % 1) * this.tileWidth, (subTileY % 1) * this.tileHeight,
                this.tileWidth / zoomFactor, this.tileHeight / zoomFactor,
                Math.round(tile.x), Math.round(tile.y),
                Math.ceil(tile.scaling * this.tileWidth / zoomFactor), Math.ceil(tile.scaling * this.tileHeight / zoomFactor)
            );
            break;
        }
    }

    // Find completed tiles in the (single one) zoom level below the given zoom level.
    if (zl == zoomLevels.length - 1) {
        return;
    }
    var zoomLevel = zoomLevels[zl + 1];
    var leftTileX = Math.round((minX - this.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.round((this.maxY - maxY) / zoomLevel.resolution / this.tileHeight), 0);
    for (var tileY = topTileY; tileY <= topTileY + 1; tileY++) {
        for (var tileX = leftTileX; tileX <= leftTileX + 1; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            if ((tile != null) && (tile.completed)) {
                tile.reset(this.bounds, this.centerScale);
                this.drawTile(tile);
            }
        }
    }
}

TileModel.prototype.drawTile = function(tile) {
    this.ctx.drawImage(
        tile.data,
        Math.round(tile.x), Math.round(tile.y),
        Math.ceil(tile.scaling * this.tileWidth), Math.ceil(tile.scaling * this.tileHeight)
    );
}

