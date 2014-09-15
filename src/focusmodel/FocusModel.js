function FocusModel() {
    this.animationTimer = new Timer(50, 20);
    this.incubationTimer = new Timer(1000, 1);
    this.minScale = 0;
    this.maxScale = Number.MAX_VALUE;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animationCenterScales = [];
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
}

FocusModel.prototype.setCenterScale = function(centerScale, pixXOffset, pixYOffset) {
    if (centerScale == null) {
        return;
    }
    centerScale = this.precond(centerScale);
    var scale = centerScale.scale;
    var centerX = centerScale.centerX - (pixXOffset * 0.000352778 * scale);
    var centerY = centerScale.centerY + (pixYOffset * 0.000352778 * scale);
    centerScale = new CenterScale(centerX, centerY, scale);
    if (this.centerScale == null) {
        this.centerScale = centerScale;
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.setAnimationCenterScale(centerScale);
    this.setIncubationCenterScale(centerScale);
}

FocusModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.animationTimer.reset();
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        focusModel.animationCenterScale = focusModel.animationCenterScales[focusModel.animationTimer.currentCount];
    };
    
    this.setAnimationCenterScales(animationCenterScale);
    this.animationCenterScale = this.animationCenterScales[0];
    
    this.animationTimer.start();
}

FocusModel.prototype.setIncubationCenterScale = function(incubationCenterScale) {
    this.incubationTimer.reset();
    var focusModel = this;
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = incubationCenterScale;
    };
    
    this.incubationTimer.start();
}

FocusModel.prototype.bazoo = function(x, y, pixXOffset, pixYOffset) {
    if (!this.animationTimer.isRunning()) {
        return;
    }
    
    var cs = null;
    if (this.animationCenterScales[this.animationTimer.currentCount].scale == this.centerScale.scale) {
        this.animationTimer.reset();
        animationCenterScales = [];
        cs = this.animationCenterScale;
    } else {
        var scale = this.centerScale.scale;
        var centerX = x - (pixXOffset * 0.000352778 * scale);
        var centerY = y + (pixYOffset * 0.000352778 * scale);
        cs = new CenterScale(centerX, centerY, scale);
        this.setAnimationCenterScales(cs);
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.pan = function(dx, dy) {
    var cs = new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale);
    if (this.animationTimer.isRunning()) {
        this.setAnimationCenterScales(cs);
    } else {
        this.animationCenterScale = cs;
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.setAnimationCenterScales = function(centerScale) {
    var animationCenterScales = new Array(this.animationTimer.numRepeats + 1);
    var numRemaining = this.animationTimer.numRepeats - this.animationTimer.currentCount;
    var dCenterX = (centerScale.centerX - this.animationCenterScale.centerX) / numRemaining;
    var dCenterY = (centerScale.centerY - this.animationCenterScale.centerY) / numRemaining;
    var dScale = (centerScale.scale - this.animationCenterScale.scale) / numRemaining;
    var m = -1;
    
    for (var i = this.animationTimer.currentCount; i < this.animationTimer.numRepeats; i++) {
        m = i - this.animationTimer.currentCount;
        animationCenterScales[i] = new CenterScale(
            this.animationCenterScale.centerX + (-dCenterX / numRemaining * m * m + 2 * dCenterX * m),
            this.animationCenterScale.centerY + (-dCenterY / numRemaining * m * m + 2 * dCenterY * m),
            this.animationCenterScale.scale + (-dScale / numRemaining * m * m + 2 * dScale * m)
        );
    }
    animationCenterScales[this.animationTimer.numRepeats] = centerScale;
    
    this.animationCenterScales = animationCenterScales;
}

FocusModel.prototype.precond = function(centerScale) {
    var centerX = centerScale.centerX;
    var centerY = centerScale.centerY;
    var scale = centerScale.scale;
    
    if (scale < this.minScale) {
        return this.precond(new CenterScale(centerX, centerY, this.minScale));
    }
    if (scale > this.maxScale) {
        return this.precond(new CenterScale(centerX, centerY, this.maxScale));
    }
    if (this.scaleToZoomLevels) {
        var zoomLevelScale = getZoomLevel(scale, true).scale;
        if (scale != zoomLevelScale) {
            return new CenterScale(centerX, centerY, zoomLevelScale);
        }
    }
    return new CenterScale(centerX, centerY, scale);
}

