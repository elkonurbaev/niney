export function UTFGridModel() {
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
    this.protocol = "UTFGrid";
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.tiles = [];
    this.tileIndex = {};
    this.ctx = null;  // Not used for UTFGrid tile models.
    
    this.resolution = 4;
}

UTFGridModel.prototype = new TileModel();
UTFGridModel.prototype.constructor = UTFGridModel;

UTFGridModel.prototype.loadTileData = function(tile) {
    /*var f = function(t) {
        return function(data, status, headers, config) {
            t.data = eval(data);
        }
    }(tile);
    this.http({ method: "GET", url: tile.url, cache: true }).success(f);*/
}

UTFGridModel.prototype.getFeature = function(pixX, pixY) {
    var zoomLevel = this.srs.getZoomLevel(this.animationCenterScale.scale, this.maxZoomLevel);
    var worldX = this.animationCenterScale.getWorldX(this.bounds.width, pixX);
    var worldY = this.animationCenterScale.getWorldY(this.bounds.height, pixY);
    var tileX = Math.floor((worldX - this.srs.minX) / zoomLevel.resolution / this.tileWidth);
    var tileY = Math.max(Math.floor((this.srs.maxY - worldY) / zoomLevel.resolution / this.tileHeight), 0);
    var tile = this.getTile(tileX, tileY, zoomLevel.scale);
    if (tile == null) {
        return null;
    }
    
    var utfGrid = tile.data;
    if (utfGrid == null) {
        return null;
    }
    
    var xInTile = Math.floor((pixX - tile.x) / tile.scaling / this.resolution);
    var yInTile = Math.floor((pixY - tile.y) / tile.scaling / this.resolution);
    if (utfGrid.grid[yInTile] == null) {
        return null;
    }
    
    var index = this.getIndex(utfGrid.grid[yInTile].charCodeAt(xInTile));
    var key = utfGrid.keys[index];
    if (!utfGrid.data.hasOwnProperty(key)) {
        return null;
    }
    
    return utfGrid.data[key];
}

UTFGridModel.prototype.getIndex = function(utfCode) {
    if (utfCode >= 93) {
        utfCode--;
    }
    if (utfCode >= 35) {
        utfCode--;
    }
    return utfCode - 32;
}

function grid(utfGridString) {
    return utfGridString;
}

