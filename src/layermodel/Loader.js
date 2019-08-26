function Loader() {
    this.layers = {};
    this.numLoading = 0;
}

Loader.prototype.add = function(key) {
    if (this.layers[key] == null) {
        this.layers[key] = 0;
    }
    this.layers[key]++;
    this.setNumLoading();
}

Loader.prototype.subtract = function(key) {
    this.layers[key]--;
    this.setNumLoading();
}

Loader.prototype.set = function(key) {
    this.layers[key] = 1;
    this.setNumLoading();
}

Loader.prototype.reset = function(key) {
    this.layers[key] = 0;
    this.setNumLoading();
}

Loader.prototype.remove = function(key) {
    delete this.layers[key];
    this.setNumLoading();
}

Loader.prototype.setNumLoading = function() {
    this.numLoading = 0;
    for (key in this.layers) {
        this.numLoading += this.layers[key];
    }
}

