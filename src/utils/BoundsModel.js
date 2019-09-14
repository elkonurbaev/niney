export function BoundsModel() {
    this.incubationTimer = new Timer(1000, 1);
    this.bounds = null;
    this.incubationBounds = null;
    
    var boundsModel = this;
    this.incubationTimer.timerHandler = function() {
        boundsModel.incubationBounds = boundsModel.bounds;
    };
}

BoundsModel.prototype.setBounds = function(bounds) {
    if (this.bounds == null) {
        this.bounds = bounds;
        this.incubationBounds = bounds;
        return;
    }
    if (this.bounds.equals(bounds)) {
        return;
    }
    
    this.bounds = bounds;
    this.setIncubationBounds();
}

BoundsModel.prototype.setIncubationBounds = function() {
    this.incubationTimer.reset();
    this.incubationTimer.start();
}

