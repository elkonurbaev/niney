function UTFGridModel() {
    this.http = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.resolution = 4;
    this.numColumns = -1;
    this.firstTile = null;
    this.utfGrids = [];
}

UTFGridModel.prototype.setTiles = function(numColumns, tiles) {
    this.numColumns = numColumns;
    this.firstTile = tiles.length > 0 ? tiles[0] : null;
    this.utfGrids = new Array(tiles.length);
    
    var utfGrids = this.utfGrids;
    for (var i = 0; i < tiles.length; i++) {
        var f = function(j) {
            return function(data, status, headers, config) {
                utfGrids[j] = eval(data);
            }
        }(i);
        this.http({ method: "GET", url: tiles[i].url, cache: true }).success(f);
    }
}

UTFGridModel.prototype.getFeature = function(mouseX, mouseY) {
    if ((this.numColumns == -1) || (this.firstTile == null)) {
        return null;
    }
    var x0 = (mouseX - this.firstTile.x);
    var y0 = (mouseY - this.firstTile.y);
    var tileIndex = Math.floor(x0 / this.tileWidth) + this.numColumns * Math.floor(y0 / this.tileHeight);
    var xInTile = Math.floor((x0 % this.tileWidth) / this.resolution);
    var yInTile = Math.floor((y0 % this.tileHeight) / this.resolution);
    var tile = this.utfGrids[tileIndex];
    if (tile == null) {
        return null;
    }
    var index = this.getIndex(tile.grid[yInTile].charCodeAt(xInTile));
    var key = tile.keys[index];
    if (!tile.data.hasOwnProperty(key)) {
        return null;
    }
    tile.data[key].fid = key;
    return tile.data[key];
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

