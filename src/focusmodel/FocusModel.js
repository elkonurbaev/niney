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

FocusModel.prototype.bazoo = function(x, y, pixXOffset, pixYOffset) {
    if (!this.animationTimer.isRunning() && !this.incubationTimer.isRunning()) {
        return;
    }
    
    var cs = null;
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScales[this.animationTimer.currentCount].scale == this.centerScale.scale) {
            this.animationTimer.reset();
            animationCenterScales = [];
            cs = this.animationCenterScale;
        } else {
            var scale = this.centerScale.scale;
            var centerX = x - (pixXOffset * 0.000352778 * scale);
            var centerY = y + (pixYOffset * 0.000352778 * scale);
            cs = this.centercon(new CenterScale(centerX, centerY, scale));
            this.setAnimationCenterScales(cs);
        }
        this.centerScale = cs;
    } else {  // incubationTimer.isRunning()
        cs = this.centerScale;  // == animationCenterScale
    }
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.pan = function(dx, dy) {
    var cs = null;
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScales[this.animationTimer.currentCount].scale == this.centerScale.scale) {
            this.animationTimer.reset();
            animationCenterScales = [];
            cs = this.centercon(new CenterScale(this.animationCenterScale.centerX + dx, this.animationCenterScale.centerY + dy, this.animationCenterScale.scale));
            this.animationCenterScale = cs;
        } else {
            cs = this.centercon(new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale));
            this.setAnimationCenterScales(cs);
        }
    } else {
        cs = this.centercon(new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale));
        this.animationCenterScale = cs;
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.sawoo = function(cs, pixXOffset, pixYOffset, animate) {
    cs = this.scalecon(cs, animate);
    var scale = cs.scale;
    var centerX = cs.centerX - (pixXOffset * 0.000352778 * scale);
    var centerY = cs.centerY + (pixYOffset * 0.000352778 * scale);
    cs = this.centercon(new CenterScale(centerX, centerY, scale));
    
    if (this.centerScale.equals(cs)) {
        return;
    }
    
    if (animate) {
        this.setAnimationCenterScale(cs);
    } else {
        if (this.animationTimer.isRunning()) {
            this.animationTimer.reset();
            animationCenterScales = [];
        }
        this.animationCenterScale = cs;
    }
    this.centerScale = cs;
    this.setIncubationCenterScale(cs);
}

FocusModel.prototype.setCenterScale = function(centerScale, roundToZoomLevels) {
    if (centerScale == null) {
        return;
    }
    if (roundToZoomLevels == null) {
        roundToZoomLevels = true;
    }
    
    centerScale = this.centercon(this.scalecon(centerScale, roundToZoomLevels));
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

// Center-related conditions. Relevant for zooming and panning.
FocusModel.prototype.centercon = function(centerScale) {
    var centerX = Math.min(Math.max(centerScale.centerX, this.maxEnvelope.getMinX()), this.maxEnvelope.getMaxX());
    var centerY = Math.min(Math.max(centerScale.centerY, this.maxEnvelope.getMinY()), this.maxEnvelope.getMaxY());
    return new CenterScale(centerX, centerY, centerScale.scale);
}

// Scale-related conditions. Relevant for zooming only.
FocusModel.prototype.scalecon = function(centerScale, roundToZoomLevels) {
    if (centerScale.scale < this.minScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale), roundToZoomLevels);
    }
    if (centerScale.scale > this.maxScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale), roundToZoomLevels);
    }
    if (this.scaleToZoomLevels) {
        var zoomLevelScale = getZoomLevel(centerScale.scale, roundToZoomLevels).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    return centerScale;
}

