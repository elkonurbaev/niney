export function WMSModel() {
    this.bounds = null;
    this.incubationBounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.layer = null;
    this.loader = null;
    this.autoClassification = true;
    this.info = null;
    this.tile = null;
    this.previousTile = null;
    this.ctx = null;
}

WMSModel.prototype.setBounds = function(bounds) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.resetTiles();
}

WMSModel.prototype.setIncubationBounds = function(incubationBounds) {
    this.incubationBounds = incubationBounds;
    this.load();
}

WMSModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.load();
}

WMSModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationCenterScale = animationCenterScale;
    this.resetTiles();
}

WMSModel.prototype.setLayer = function(layer) {
    if ((this.loader != null) && (this.layer != null)) {
        this.loader.remove(this.layer.name);
    }
    if ((this.loader != null) && (layer != null)) {
        this.loader.reset(layer.name);
    }
    this.layer = layer;
    this.tile = null;
    this.previousTile = null;
    this.load();
}

WMSModel.prototype.load = function(infoOnly) {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    if (this.info != null) {
        this.info.value = null;
    }
    
    if (!infoOnly) {
        if ((this.tile != null) && this.tile.completed && !this.tile.corrupted) {
            this.previousTile = this.tile;
        }
        this.tile = null;
        
        if (this.ctx != null) {
            this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
        }
    }
    
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.minX;
    var minY = envelope.minY;
    var maxX = envelope.maxX;
    var maxY = envelope.maxY;
    
    if ((minX > this.srs.maxX) || (minY > this.srs.maxY) || (maxX < this.srs.minX) || (maxY < this.srs.minY)) {
        return;
    }
    
    minX = Math.max(minX, this.srs.minX);
    minY = Math.max(minY, this.srs.minY);
    maxX = Math.min(maxX, this.srs.maxX);
    maxY = Math.min(maxY, this.srs.maxY);
    
    var tileWidth = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var tileHeight = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
    if (this.info != null) {
        var f = function(info) {
            return function() {
                if ((xhr.readyState == 4) && (xhr.status == 200)) {
                    info.value = xhr.responseText;
                }
            };
        }(this.info);
        var x = Math.round(this.info.x - this.centerScale.getPixX(this.bounds.width, minX));
        var y = Math.round(this.info.y - this.centerScale.getPixY(this.bounds.height, maxY));
        var url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, tileWidth, tileHeight, this.autoClassification, { x: x, y: y });
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = f;
        xhr.send();
    }
    
    if (!infoOnly) {
        var url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, tileWidth, tileHeight, this.autoClassification, null);
        
        if (this.loader != null) {
            this.loader.set(this.layer.name);
        }
        this.tile = new Tile(minX, maxY, this.centerScale.scale, 1, 1, tileWidth, tileHeight, url);
        
        if (this.animationCenterScale != null) {
            this.tile.reset(this.bounds, this.animationCenterScale);
            if (this.previousTile != null) {
                this.previousTile.reset(this.bounds, this.animationCenterScale);
            }
        }
        
        if (this.ctx != null) {
            if (this.previousTile != null) {
                this.drawTile(this.previousTile);
            }
            var f = function(t, env, success) { return function() { env.completeTile(t, success); }};
            this.tile.data = new Image();
            this.tile.data.addEventListener("load", f(this.tile, this, true));
            this.tile.data.addEventListener("error", f(this.tile, this, false));
            this.tile.data.src = this.tile.url;
        }
    }
}

WMSModel.prototype.resetTiles = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    if (this.tile != null) {
        this.tile.reset(this.bounds, this.animationCenterScale);
        if (this.previousTile != null) {
            this.previousTile.reset(this.bounds, this.animationCenterScale);
        }
    }
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
        if (this.tile != null) {
            if (this.tile.completed && !this.tile.corrupted) {
                this.drawTile(this.tile);
            } else if (this.previousTile != null) {
                this.drawTile(this.previousTile);
            }
        }
    }
}

WMSModel.prototype.completeTile = function(tile, success) {
    if (this.tile != tile) {
        return;
    }
    
    if (this.loader != null) {
        this.loader.reset(this.layer.name);
    }
    tile.completed = true;
    
    if (success) {
        tile.corrupted = false;
        
        this.previousTile = null;
        
        if (this.animationCenterScale != null) {
            tile.reset(this.bounds, this.animationCenterScale);
            if (this.ctx != null) {
                this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
                this.drawTile(tile);
            }
        }
    } else {
        tile.corrupted = performance.now();
        
        console.log("Error loading WMS: " + tile.url);
    }
}

WMSModel.prototype.drawTile = function(tile) {
    this.ctx.drawImage(
        tile.data,
        Math.round(tile.x), Math.round(tile.y),
        Math.round(tile.scaling * tile.tileWidth), Math.round(tile.scaling * tile.tileHeight)
    );
}

