export function TileModel() {
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
    this.protocol = "TMS";
    this.numResetRuns = 1;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Used only for tile models that draw on a canvas.
}

TileModel.prototype.setBoundsAndCenterScales = function(bounds, centerScale, animationCenterScale, envelope, animationEnvelope) {
    if (bounds == null) {
        return;
    }
    
    var boundsChanged = false;
    var centerScaleChanged = false;
    var animationCenterScaleChanged = false;
    if (!bounds.equals(this.bounds)) {
        this.bounds = bounds;
        boundsChanged = true;
    }
    if (!centerScale.equals(this.centerScale)) {
        this.centerScale = centerScale;
        centerScaleChanged = true;
    }
    if (!animationCenterScale.equals(this.animationCenterScale)) {
        this.animationCenterScale = animationCenterScale;
        animationCenterScaleChanged = true;
    }
    
    this.envelope = envelope;
    this.animationEnvelope = animationEnvelope;
    
    if (boundsChanged || centerScaleChanged) {
        this.loadTiles();
    }
    if (boundsChanged || animationCenterScaleChanged) {
        this.resetTiles();
    }
}

TileModel.prototype.setBounds = function(bounds, envelope, animationEnvelope) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
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
    if (this.layer == layer) {
        return;
    }
    
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
    //this.resetTiles();
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
    if (this.maxEnvelope != null) {
        envelope = envelope.intersection(this.maxEnvelope);
    }
    if (envelope == null) {
        return;
    }
    
    var zoomLevel = this.srs.getZoomLevel(this.centerScale.scale, this.maxZoomLevel);
    var tp = this.getTilePositions(zoomLevel, envelope);
    for (var i = 0; i < tp.length; i++) {
        var tile = tp[i].tile;
        if ((tile == null) || (tile.corrupted && (tile.corrupted + 7000 < performance.now())) || tp[i].tileNeedsReload) {
            if (tile == null) {
                tile = this.createAndAddTile(zoomLevel, tp[i].tileX, tp[i].tileY);
            } else {
                tile.completed = false;
                tile.corrupted = false;
            }
            
            if (this.loader != null) {
                this.loader.add(this.layer.name);
            }
            
            this.loadTileData(tile);
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
    if (this.maxEnvelope != null) {
        envelope = envelope.intersection(this.maxEnvelope);
    }
    if (envelope == null) {
        return;
    }
    
    var zoomLevel = this.srs.getZoomLevel(this.animationCenterScale.scale, this.maxZoomLevel);
    var tp = this.getTilePositions(zoomLevel, envelope);
    for (var j = 0; j < this.numResetRuns; j++) {
        for (var k = 0; k < tp.length; k++) {
            var tile = tp[k].tile;
            if (this.ctx != null) {
                if ((tile != null) && tile.completed && !tile.corrupted && !tp[k].tileNeedsReload) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    this.drawTile(tile, false, j);
                } else if (j == 0) {
                    var minX = tp[k].tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
                    var maxY = -(tp[k].tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
                    this.drawTilesAroundZoomLevel(zoomLevel.zoomLevel, zoomLevel.resolution, minX, maxY);
                }
            } else {
                if ((tile != null) && and (j == 0)) {
                    tile.reset(this.bounds, this.animationCenterScale);
                    tile.completed = true;
                }
            }
        }
    }
}

TileModel.prototype.getTilePositions = function(zoomLevel, envelope) {
    var tilePositions = [];
    var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
    var leftTileX = Math.floor((envelope.minX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.srs.maxY - envelope.maxY) / zoomLevel.resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.srs.maxY - envelope.minY) / zoomLevel.resolution / this.tileHeight), tileLimit - 1);
    
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            var tile = this.getTile(zoomLevel.zoomLevel, tileX, tileY);
            tilePositions.push({
                tileX: tileX,
                tileY: tileY,
                tile: tile,
                tileNeedsReload: tile? this.tileNeedsReload(tile): null
            });
        }
    }
    
    return tilePositions;
}

TileModel.prototype.createAndAddTile = function(zoomLevel, tileX, tileY) {
    var minX = tileX * this.tileWidth * zoomLevel.resolution + this.srs.minX;
    var maxY = -(tileY * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
    
    var url = null;
    if (this.protocol != "WMTS") {
        var tileLimit = Math.pow(2, zoomLevel.zoomLevel);
        url = this.layer.urlExtension;
        url = url.replace("$Z", zoomLevel.zoomLevel);
        url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
        url = url.replace("$Y", tileY);
        url = this.layer.baseURL + url;
    } else {
        var maxX = (tileX + 1) * this.tileWidth * zoomLevel.resolution + this.srs.minX;
        var minY = -((tileY + 1) * this.tileHeight * zoomLevel.resolution - this.srs.maxY);
        url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, this.tileWidth, this.tileHeight, true, null);
    }
    
    var tile = this.createTile(minX, maxY, zoomLevel.scale, tileX, tileY, this.tileWidth, this.tileHeight, url);
    
    this.addTile(zoomLevel.zoomLevel, tile);
    
    return tile;
}

TileModel.prototype.createTile = function(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url) {
    return new Tile(minX, maxY, scale, tileX, tileY, tileWidth, tileHeight, url);
}

TileModel.prototype.addTile = function(zoomLevel, tile) {
    var tileX = tile.tileX;
    var tileY = tile.tileY;
    
    if (this.tileIndex[zoomLevel] == null) {
        this.tileIndex[zoomLevel] = {};
    }
    if (this.tileIndex[zoomLevel][tileX] == null) {
        this.tileIndex[zoomLevel][tileX] = {};
    }
    this.tileIndex[zoomLevel][tileX][tileY] = this.tiles.push(tile) - 1;
}

TileModel.prototype.getTile = function(zoomLevel, tileX, tileY) {
    if ((this.tileIndex[zoomLevel] == null) || (this.tileIndex[zoomLevel][tileX] == null) || (this.tileIndex[zoomLevel][tileX][tileY] == null)) {
        return null;
    }
    
    return this.tiles[this.tileIndex[zoomLevel][tileX][tileY]];
}

TileModel.prototype.tileNeedsReload = function(tile) {
    return false;
}

TileModel.prototype.loadTileData = function(tile) {
    if (this.ctx != null) {
        var f = function(t, env, success) { return function() { env.completeTile(t, success); }};
        
        tile.data = new Image();
        tile.data.addEventListener("load", f(tile, this, true));
        tile.data.addEventListener("error", f(tile, this, false));
        tile.data.src = tile.url;
    }
}

TileModel.prototype.completeTile = function(tile, success) {
    var zoomLevel = this.srs.getZoomLevel(tile.scale, this.maxZoomLevel);
    if (this.getTile(zoomLevel.zoomLevel, tile.tileX, tile.tileY) != tile) {
        return;
    }
    
    if (this.loader != null) {
        this.loader.subtract(this.layer.name);
    }
    tile.completed = true;
    
    if (success) {
        tile.corrupted = false;
        
        if (
            (this.layer != null) && this.layer.visible &&
            (this.animationCenterScale != null) && (this.srs.getZoomLevel(this.animationCenterScale.scale, this.maxZoomLevel).zoomLevel == zoomLevel.zoomLevel)
        ) {
            this.resetTiles();
        }
    } else {
        tile.corrupted = performance.now();
        
        console.log("Error loading tile: " + tile.url);
    }
}

TileModel.prototype.drawTilesAroundZoomLevel = function(zl, rs, minX, maxY) {
    // Find any completed tile in the zoom levels above the given zoom level.
    for (var zoomLevel = zl - 1, resolution = rs * 2; zoomLevel >= 0; zoomLevel--, resolution *= 2) {
        var zoomFactor = Math.pow(2, zl - zoomLevel);
        var subTileX = Math.round((minX - this.srs.minX) / resolution / this.tileWidth * zoomFactor) / zoomFactor;
        var tileX = Math.floor(subTileX);
        var subTileY = Math.round((this.srs.maxY - maxY) / resolution / this.tileHeight * zoomFactor) / zoomFactor;
        var tileY = Math.max(Math.floor(subTileY), 0);
        var tile = this.getTile(zoomLevel, tileX, tileY);
        if ((tile != null) && tile.completed && !tile.corrupted && !this.tileNeedsReload(tile)) {
            tile.resetWithPoint(this.bounds, this.animationCenterScale, minX, maxY);
            this.drawTilePartly(tile, (subTileX % 1) * tile.tileWidth, (subTileY % 1) * tile.tileHeight, tile.tileWidth / zoomFactor, tile.tileHeight / zoomFactor);
            break;
        }
    }

    // Find completed tiles in the (single one) zoom level below the given zoom level.
    var zoomLevel = zl + 1;
    var resolution = rs / 2;
    var leftTileX = Math.round((minX - this.srs.minX) / resolution / this.tileWidth);
    var topTileY = Math.max(Math.round((this.srs.maxY - maxY) / resolution / this.tileHeight), 0);
    for (var tileY = topTileY; tileY <= topTileY + 1; tileY++) {
        for (var tileX = leftTileX; tileX <= leftTileX + 1; tileX++) {
            var tile = this.getTile(zoomLevel, tileX, tileY);
            if ((tile != null) && tile.completed && !tile.corrupted && !this.tileNeedsReload(tile)) {
                tile.reset(this.bounds, this.animationCenterScale);
                this.drawTile(tile, true);
            }
        }
    }
}

TileModel.prototype.drawTile = function(tile, clear, run) {
    var x = Math.round(tile.x);
    var y = Math.round(tile.y);
    var width = Math.round(tile.x - x + tile.scaling * tile.tileWidth);
    var height = Math.round(tile.y - y + tile.scaling * tile.tileHeight);
    if (clear) {
        this.ctx.clearRect(x, y, width, height);
    }
    this.drawTileImage(tile, x, y, width, height, run);
}

TileModel.prototype.drawTileImage = function(tile, dx, dy, dWidth, dHeight, run) {
    this.ctx.drawImage(tile.data, dx, dy, dWidth, dHeight);
}

TileModel.prototype.drawTilePartly = function(tile, x, y, width, height) {
    this.ctx.drawImage(
        tile.data,
        x, y,
        width, height,
        Math.round(tile.x), Math.round(tile.y),
        Math.ceil(tile.scaling * width), Math.ceil(tile.scaling * height)
    );
}

