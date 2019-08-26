function TileModel() {
    this.bounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.envelope = null;
    this.animationEnvelope = null;
    this.layer = null;
    this.loader = null;
    this.protocol = "TMS";
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
    this.http = null;  // Used only for UTFGrid tile models.
}

TileModel.prototype.setBounds = function(bounds, envelope, animationEnvelope) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.envelope = envelope;
    this.animationEnvelope = animationEnvelope;
    this.loadTiles();
    this.resetTiles();
}

TileModel.prototype.setCenterScale = function(centerScale, envelope) {
    this.centerScale = centerScale;
    this.envelope = envelope;
    this.loadTiles();
}

TileModel.prototype.setAnimationCenterScale = function(animationCenterScale, animationEnvelope) {
    this.animationCenterScale = animationCenterScale;
    this.animationEnvelope = animationEnvelope;
    this.resetTiles();
}

TileModel.prototype.setLayer = function(layer) {
    if ((this.loader != null) && (this.layer != null)) {
        this.loader.remove(this.layer.name);
    }
    if ((this.loader != null) && (layer != null)) {
        this.loader.reset(layer.name);
    }
    this.layer = layer;
    this.tiles = [];
    this.tileIndex = {};
    this.loadTiles();
    this.resetTiles();
}

TileModel.prototype.loadTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.envelope;
    if (envelope == null) {
        envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    }
    var zoomLevel = this.srs.getZoomLevel(this.centerScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.srs.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.srs.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if ((tile == null) || (tile.corrupted && (tile.corrupted + 7000 < performance.now()))) {
                if (tile == null) {
                    var minX = tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                    var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                    
                    var url = null;
                    if (this.protocol == "TMS") {
                        url = this.layer.urlExtension;
                        url = url.replace("$Z", zoomLevel.zoomLevel);
                        url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
                        url = url.replace("$Y", tileY);
                        url = this.layer.baseURL + url;
                    } else {  // WMTS
                        var maxX = (tileX + 1) * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                        var minY = -((tileY + 1) * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                        url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, this.tileWidth, this.tileHeight, true);
                    }
                    
                    tile = new Tile(minX, maxY, zoomLevel.scale, tileX, tileY, this.tileWidth, this.tileHeight, url);
                    this.addTile(zoomLevel.zoomLevel, tile);
                } else {
                    tile.completed = false;
                    tile.corrupted = false;
                }
                
                if (this.loader != null) {
                    this.loader.add(this.layer.name);
                }
                
                if (this.ctx != null) {
                    var f = function(t, env, success) { return function() { env.completeTile(t, success); }};
                    
                    tile.data = new Image();
                    tile.data.addEventListener("load", f(tile, this, true));
                    tile.data.addEventListener("error", f(tile, this, false));
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
        }
    }
}

TileModel.prototype.resetTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    } else {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].completed = false;
        }
    }
    
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.animationEnvelope;
    if (envelope == null) {
        envelope = this.animationCenterScale.toEnvelope(this.bounds.width, this.bounds.height);
    }
    var zoomLevel = this.srs.getZoomLevel(this.animationCenterScale.scale);
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.srs.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.srs.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            
            if (this.ctx != null) {
                if ((tile != null) && tile.completed && !tile.corrupted) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    this.drawTile(tile, true);
                } else {
                    var minX = tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                    var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                    this.drawTilesAroundZoomLevel(zoomLevel.zoomLevel, minX, maxY);
                }
            } else {
                if (tile != null) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    tile.completed = true;
                }
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

TileModel.prototype.completeTile = function(tile, success) {
    var zoomLevel = this.srs.getZoomLevel(tile.scale);
    if (this.getTile(zoomLevel.zoomLevel, tile.tileX, tile.tileY) != tile) {
        return;
    }
    
    if (this.loader != null) {
        this.loader.subtract(this.layer.name);
    }
    tile.completed = true;
    
    if (success) {
        tile.corrupted = false;
        
        if ((this.animationCenterScale != null) && (this.srs.getZoomLevel(this.animationCenterScale.scale) == zoomLevel)) {
            tile.reset(this.bounds, this.animationCenterScale);
            if (this.ctx != null) {
                this.drawTile(tile, true);
            }
        }
    } else {
        tile.corrupted = performance.now();
        
        console.log("Error loading tile: " + tile.url);
    }
}

TileModel.prototype.drawTilesAroundZoomLevel = function(zl, minX, maxY) {
    // Find any completed tile in the zoom levels above the given zoom level.
    for (var i = zl - 1; i >= 0; i--) {
        var zoomLevel = this.srs.zoomLevels[i];
        var zoomFactor = Math.pow(2, zl - i);
        var subTileX = Math.round((minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth * zoomFactor) / zoomFactor;
        var tileX = Math.floor(subTileX);
        var subTileY = Math.round((this.srs.maxY - maxY) / zoomLevel.resolution / this.tileHeight * zoomFactor) / zoomFactor;
        var tileY = Math.max(Math.floor(subTileY), 0);
        var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
        if ((tile != null) && tile.completed && !tile.corrupted) {
            tile.resetWithPoint(this.bounds, this.animationCenterScale, minX, maxY);
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
    if (zl == this.srs.zoomLevels.length - 1) {
        return;
    }
    var zoomLevel = this.srs.zoomLevels[zl + 1];
    var leftTileX = Math.round((minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.round((this.srs.maxY - maxY) / zoomLevel.resolution / this.tileHeight), 0);
    for (var tileY = topTileY; tileY <= topTileY + 1; tileY++) {
        for (var tileX = leftTileX; tileX <= leftTileX + 1; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            if ((tile != null) && tile.completed && !tile.corrupted) {
                tile.reset(this.bounds, this.animationCenterScale);
                this.drawTile(tile, false);
            }
        }
    }
}

TileModel.prototype.drawTile = function(tile, clear) {
    var x = Math.round(tile.x);
    var y = Math.round(tile.y);
    var width = Math.round(tile.x + tile.scaling * this.tileWidth) - x;
    var height = Math.round(tile.y + tile.scaling * this.tileHeight) - y;
    if (clear) {
        this.ctx.clearRect(x, y, width, height);
    }
    this.ctx.drawImage(tile.data, x, y, width, height);
}

