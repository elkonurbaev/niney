function FocusModel() {
    this.animationTimer = new Timer(50, 20);
    this.incubationTimer = new Timer(1000, 1);
    this.maxEnvelope = new Envelope(-20000000, -20000000, 20000000, 20000000);
    this.minScale = 0;
    this.maxScale = 443744272.72414012;
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
    centerScale = this.precon(centerScale);
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
        var postcon = focusModel.postcon(incubationCenterScale);
        if (postcon == incubationCenterScale) {
            focusModel.incubationCenterScale = incubationCenterScale;
        } else {
            focusModel.setCenterScale(postcon, 0, 0);
        }
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

FocusModel.prototype.precon = function(centerScale) {
    if (centerScale.scale < this.minScale) {
        return this.precon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale));
    }
    if (centerScale.scale > this.maxScale) {
        return this.precon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale));
    }
    if (this.scaleToZoomLevels) {
        var zoomLevelScale = getZoomLevel(centerScale.scale, true).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    return centerScale;
}

FocusModel.prototype.postcon = function(centerScale) {
    if (centerScale.centerX < this.maxEnvelope.minX) {
        return this.postcon(new CenterScale(this.maxEnvelope.minX, centerScale.centerY, centerScale.scale));
    }
    if (centerScale.centerX > this.maxEnvelope.maxX) {
        return this.postcon(new CenterScale(this.maxEnvelope.maxX, centerScale.centerY, centerScale.scale));
    }
    if (centerScale.centerY < this.maxEnvelope.minY) {
        return this.postcon(new CenterScale(centerScale.centerX, this.maxEnvelope.minY, centerScale.scale));
    }
    if (centerScale.centerY > this.maxEnvelope.maxY) {
        return this.postcon(new CenterScale(centerScale.centerX, this.maxEnvelope.maxY, centerScale.scale));
    }
    return centerScale;
}

