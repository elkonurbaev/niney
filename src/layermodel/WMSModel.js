function WMSModel() {
    this.bounds = null;
    this.layer = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.autoClassification = true;
    this.tile = null;
}

WMSModel.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
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

WMSModel.prototype.load = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.getMinX();
    var minY = envelope.getMinY();
    var maxX = envelope.getMaxX();
    var maxY = envelope.getMaxY();
    
    if ((minX > 20000000) || (minY > 20000000) || (maxX < -20000000) || (maxY < -20000000)) {
        return;
    }
    
    minX = Math.max(minX, -20000000);
    minY = Math.max(minY, -20000000);
    maxX = Math.min(maxX, 20000000);
    maxY = Math.min(maxY, 20000000);
    
    var tileWidth = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var tileHeight = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
    var url = this.layer.baseURL;
    url += (url.indexOf("?") == -1 ? "?" : "&") + "SERVICE=WMS";
    url += "&VERSION=1.1.1";
    url += "&REQUEST=GetMap";
    
    if (this.layer.styleURL == null) {
        url += "&LAYERS=" + this.layer.name;
        url += "&STYLES=";
    } else {
        var sldURL = this.layer.styleURL;
        if (this.layer.name != null) {
            sldURL += "?layer=" + this.layer.name;
        }
        var urlFilter = URLFilterConverter.filterModelsToURLFilter(this.layer.filterModels);
        if (urlFilter.length > 0) {
            sldURL += "&filter=" + urlFilter;
        }
        if (this.layer.classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(this.layer.classification));
            if ((urlFilter.length == 0) || (!this.autoClassification)) {
                sldURL += "::noFilter";
            }
        }
        url += "&SLD=" + encodeURIComponent(sldURL);
    }
    url += "&TRANSPARENT=true";
    url += "&SRS=" + this.layer.srs;
    url += "&BBOX=" + minX + "," + minY + "," + maxX + "," + maxY;
    url += "&WIDTH=" + tileWidth;
    url += "&HEIGHT=" + tileHeight;
    url += "&FORMAT=" + this.layer.format;
    url += "&EXCEPTIONS=application/vnd.ogc.se_xml";
    
    angular.forEach(this.layer.vendorSpecifics, function(value, key) {
        url += "&" + key + "=" + value;
    });
    
    if ((this.tile == null) || (this.tile.url != url)) {
        this.tile = new Tile(minX, maxY, this.centerScale.scale, 1, 1, tileWidth, tileHeight, url);
    }
    this.tile.reset(this.bounds, this.animationCenterScale);
}

WMSModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.animationCenterScale == null) {
        return;
    }
    if (this.tile == null) {
        return;
    }
    
    this.tile.reset(this.bounds, this.animationCenterScale);
}

