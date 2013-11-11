function ToggleSelectFeatureCommand(selectionModel) {
    this.selectionModel = selectionModel;
}

ToggleSelectFeatureCommand.prototype.perform = function(feature) {
    if (this.selectionModel == null) {
        throw new Error("No selection model present.");
    }
    
    if (feature == null) {
        this.selectionModel.selectedFeature = null;
    } else if (this.selectionModel.selectedFeature != feature) {
        this.selectionModel.selectedFeature = feature;
    } else {
        this.selectionModel.selectedFeature = null;
    }
}

