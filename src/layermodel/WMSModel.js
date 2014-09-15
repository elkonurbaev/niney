function WMSModel() {
    this.bounds = null;
    this.centerScale = null;
    this.animationCenterScale = null;
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
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var minX = envelope.minX;
    var minY = envelope.minY;
    var maxX = envelope.maxX;
    var maxY = envelope.maxY;
    
    if ((minX > 20000000) || (minY > 20000000) || (maxX < -20000000) || (maxY < -20000000)) {
        return;
    }
    
    minX = Math.max(minX, -20000000);
    minY = Math.max(minY, -20000000);
    maxX = Math.min(maxX, 20000000);
    maxY = Math.min(maxY, 20000000);
    
    var widthX = Math.round(this.centerScale.getNumPixs(maxX - minX));
    var heightY = Math.round(this.centerScale.getNumPixs(maxY - minY));
    
//    var url = layer.baseURL;
    var url = "http://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/ows";
    url += "?SERVICE=WMS";
    url += "&VERSION=1.1.1";
    url += "&REQUEST=GetMap";
    
//    if (layer.styleURL == null) {
//        url += "&LAYERS=" + layer.name;
        url += "&LAYERS=bestuurlijkegrenzen%3Aprovincies";
        url += "&STYLES=";
/*    } else {
        var sldURL:String = layer.styleURL;
        sldURL += "?layer=" + layer.name;
        
        var filterModels:Array = layer.filterModels;
        if (filterModels.length > 0) {
            sldURL += "&filter=" + URLFilterConverter.filterModelsToURLFilter(filterModels);
        }
        
        var classification:* = layer.classification;
        if (classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(classification));
            if ((filterModels.length == 0) || (!_autoClassification)) {
                sldURL += "::noFilter";
            }
        }
        url += "&SLD=" + encodeURIComponent(sldURL);
}*/
    url += "&TRANSPARENT=true";
    url += "&SRS=EPSG:900913";
    url += "&BBOX=" + minX + "," + minY + "," + maxX + "," + maxY;
    url += "&WIDTH=" + widthX;
    url += "&HEIGHT=" + heightY;
    url += "&FORMAT=image/png";
    url += "&EXCEPTIONS=application/vnd.ogc.se_xml";
    
    var x = this.animationCenterScale.getPixX(this.bounds.width, minX);
    var y = this.animationCenterScale.getPixY(this.bounds.height, maxY);
    var tile = new Tile(minX, maxY, widthX, heightY, url, x, y, 1);
    tile.scale = this.centerScale.scale;
    this.tile = tile;
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
    
    var x = this.animationCenterScale.getPixX(this.bounds.width, this.tile.tileX);
    var y = this.animationCenterScale.getPixY(this.bounds.height, this.tile.tileY);
    var scaling = this.tile.scale / this.animationCenterScale.scale;
    var tile = new Tile(this.tile.tileX, this.tile.tileY, this.tile.tileWidth, this.tile.tileHeight, this.tile.url, x, y, scaling);
    tile.scale = this.tile.scale;
    tile.completed = this.tile.completed;
    this.tile = tile;
}

