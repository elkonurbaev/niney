function TileModel() {
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.urlExtension = "$Z/$X/$Y.png";
    this.maxX = 20037508.3427892;
    this.maxY = 20037508.3427892;
    this.numColumns = -1;
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
    
    this.numColumns = rightTileX - leftTileX + 1;
    if (this.tileZ != tileZ) {
        this.tileZ = tileZ;
        this.tiles = [];
    }
    
    var minX = -1;
    var maxY = -1;
    var url = null;
    var x = -1;
    var y = -1;
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
            
            x = this.centerScale.getPixX(this.bounds.width, minX);
            y = this.centerScale.getPixY(this.bounds.height, maxY);
            scaling = tileScale / this.centerScale.scale;
            
            while (
                    (i < this.tiles.length) &&
                    ((this.tiles[i].tileY < tileY) || ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX < tileX)))
            ) {
                this.tiles.splice(i, 1);
            }
            
            tile = null;
            if (i >= this.tiles.length) {
                this.tiles.push(new Tile(tileX, tileY, this.tileWidth, this.tileHeight, this.layer.baseURL + url, x, y, scaling));
            } else if ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX == tileX)) {
                tile = this.tiles[i];
                tile.x = x;
                tile.y = y;
                tile.scaling = scaling;
            } else {
                this.tiles.splice(i, 0, new Tile(tileX, tileY, this.tileWidth, this.tileHeight, this.layer.baseURL + url, x, y, scaling));
            }
            i++;
        }
    }
    this.tiles.splice(i, this.tiles.length - i);
}

