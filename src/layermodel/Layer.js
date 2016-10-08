function Layer(name) {
    this.name = name;
    this.baseURL = "http://b.tile.openstreetmap.org/";
    this.styleURL = null;
    this.urlExtension = "$Z/$X/$Y.png";
    this.srs = "EPSG:900913";
    this.format = "image/png";
    this.visible = true;
    this.title = name;
    this.filterModels = [];
    this.classification = null;
    this.vendorSpecifics = {};
}

Layer.prototype.forceReload = function() {
    this.vendorSpecifics.epochtime = (new Date()).getTime();
}
