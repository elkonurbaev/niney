function ToggleSelectFeatureCommand(selectionModel, index) {
    this.selectionModel = selectionModel;
    this.index = index;
}

ToggleSelectFeatureCommand.prototype.perform = function(feature) {
    if (this.selectionModel == null) {
        throw new Error("No selection model present.");
    }
    
    if (feature == null) {
        this.selectionModel.selectedFeatures[this.index] = null;
    } else if (this.selectionModel.selectedFeatures[this.index] != feature) {
        this.selectionModel.selectedFeatures[this.index] = feature;
    } else {
        this.selectionModel.selectedFeatures[this.index] = null;
    }
}

