function WMSModel() {
    this.bounds = null;
    this.srs = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.layer = null;
    this.autoClassification = true;
    this.tile = null;
    this.previousTile = null;
    this.ctx = null;
}

WMSModel.prototype.setBounds = function(bounds) {
    if ((bounds == null) || (bounds.equals(this.bounds))) {
        return;
    }
    
    this.bounds = bounds;
    this.load();
}

WMSModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    this.load();
}

WMSModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationCenterScale = animationCenterScale;
    this.resetLoaders();
}

WMSModel.prototype.setLayer = function(layer) {
    this.layer = layer;
    this.tile = null;
    this.previousTile = null;
    this.load();
}

WMSModel.prototype.load = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    if ((this.tile != null) && this.tile.completed) {
        this.previousTile = this.tile;
    }
    this.tile = null;
    
    if (this.ctx != null) {
        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    
    if ((this.layer == null) || (!this.layer.visible)) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.getMinX();
    var minY = envelope.getMinY();
    var maxX = envelope.getMaxX();
    var maxY = envelope.getMaxY();
    
    if ((minX > this.srs.maxX) || (minY > this.srs.maxY) || (maxX < this.srs.minX) || (maxY < this.srs.minY)) {
        return;
    }
    
    minX = Math.max(minX, this.srs.minX);
    minY = Math.max(minY, this.srs.minY);
    maxX = Math.min(maxX, this.srs.maxX);
    maxY = Math.min(maxY, this.srs.maxY);
    
    var tileWidth = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var tileHeight = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
    var url = WMSProtocol.getMapURL(this.layer, this.srs, minX, minY, maxX, maxY, tileWidth, tileHeight, this.autoClassification);
    
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
        var l = function(t, env) {
            return function() {
                if (env.tile == t) {
                    env.completeLoader();
                    if (env.animationCenterScale != null) {
                        t.reset(env.bounds, env.animationCenterScale);
                        env.ctx.clearRect(0, 0, env.bounds.width, env.bounds.height);
                        env.drawTile(t);
                    }
                }
            }
        }(this.tile, this);
        var e = function(t) {
            return function() {
                t.completed = true;
                console.log("Error loading WMS: " + t.url);
            }
        }(this.tile);
        this.tile.data = new Image();
        this.tile.data.addEventListener("load", l);
        this.tile.data.addEventListener("error", e);
        this.tile.data.src = this.tile.url;
    }
}

WMSModel.prototype.resetLoaders = function() {
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
            if (this.tile.completed) {
                this.drawTile(this.tile);
            } else if (this.previousTile != null) {
                this.drawTile(this.previousTile);
            }
        }
    }
}

WMSModel.prototype.completeLoader = function() {
    this.tile.completed = true;
    this.previousTile = null;
}

WMSModel.prototype.drawTile = function(tile) {
    this.ctx.drawImage(
        tile.data,
        Math.round(tile.x), Math.round(tile.y),
        Math.round(tile.scaling * tile.tileWidth), Math.round(tile.scaling * tile.tileHeight)
    );
}

