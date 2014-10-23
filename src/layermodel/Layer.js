function Layer(name) {
    this.name = name;
    this.baseURL = "http://b.tile.openstreetmap.org/";
    this.styleURL = null;
    this.srs = "EPSG:900913";
    this.format = "image/png";
    this.visible = true;
    this.title = name;
    this.filterModels = [];
    this.classification = null;
}
