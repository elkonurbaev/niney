function FocusModel() {
    this.animationTimer = new AnimationTimer(1000);
    this.incubationTimer = new Timer(1000, 1);
    this.srs = new SRS();
    this.minScale = 0;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animation = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        var base = focusModel.animation.base;
        var delta = focusModel.animation.target.subtract(base);
        var progress = focusModel.animationTimer.currentCount / focusModel.animationTimer.duration;
        
        focusModel.animationCenterScale = new CenterScale(
            base.centerX + (-delta.centerX * progress * progress + 2 * delta.centerX * progress),
            base.centerY + (-delta.centerY * progress * progress + 2 * delta.centerY * progress),
            base.scale + (-delta.scale * progress * progress + 2 * delta.scale * progress)
        ).fromOffset(focusModel.animation.pixXOffset, focusModel.animation.pixYOffset);
    };
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = focusModel.centerScale;
    };
}

// Click or touch while zooming/panning.
FocusModel.prototype.grab = function(x, y, pixXOffset, pixYOffset) {
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScale.scale == this.centerScale.scale) {
            this.animationTimer.reset();
            this.centerScale = this.animationCenterScale;
        } else {
            this.centerScale = this.centercon(new CenterScale(x, y, this.centerScale.scale).fromOffset(pixXOffset, pixYOffset));
            this.animation = {
                base: new CenterScale(x, y, this.animation.base.scale),
                target: this.centerScale.toOffset(pixXOffset, pixYOffset),
                pixXOffset: pixXOffset,
                pixYOffset: pixYOffset
            };
        }
        this.setIncubationCenterScale();
    }
    
    if (!this.animationTimer.isRunning()) {
        this.animation = {
            base: new CenterScale(x, y, this.centerScale.scale),
            target: this.centerScale.toOffset(pixXOffset, pixYOffset),
            pixXOffset: pixXOffset,
            pixYOffset: pixYOffset
        };
    }
}

// Pan with mouse move or one-finger touch.
FocusModel.prototype.pan = function(pixXOffset, pixYOffset) {
    this.animation.pixXOffset = pixXOffset;
    this.animation.pixYOffset = pixYOffset;
}

// Pan/zoom with multi-finger touch.
FocusModel.prototype.pinchPan = function(centerScale, pixXOffset, pixYOffset) {
    centerScale = this.scalecon(centerScale, false);
    if (this.animationTimer.isRunning()) {
        this.animationTimer.reset();
    }
    
    this.animation = {
        base: centerScale,
        target: centerScale,
        pixXOffset: pixXOffset,
        pixYOffset: pixYOffset
    };
}

FocusModel.prototype.panimate = function() {
    if (!this.animationTimer.isRunning()) {
        var centerScale = this.centercon(this.animation.target.fromOffset(this.animation.pixXOffset, this.animation.pixYOffset));
        if (!this.centerScale.equals(centerScale)) {
            this.centerScale = this.animationCenterScale = centerScale;
            this.setIncubationCenterScale();
        }
    }
}

// Zoom with mouse wheel.
FocusModel.prototype.zoom = function(centerScale, pixXOffset, pixYOffset) {
    centerScale = this.scalecon(centerScale, true);
    if (this.animationCenterScale.scale == centerScale.scale) {
        return;
    }
    
    this.centerScale = this.centercon(centerScale.fromOffset(pixXOffset, pixYOffset));
    this.animation = {
        base: new CenterScale(centerScale.centerX, centerScale.centerY, this.animationCenterScale.scale),
        target: this.centerScale.toOffset(pixXOffset, pixYOffset),
        pixXOffset: pixXOffset,
        pixYOffset: pixYOffset
    };
    this.setAnimationCenterScale();
    this.setIncubationCenterScale();
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
        this.animation = {base: centerScale, target: centerScale, pixXOffset: 0, pixYOffset: 0};
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.animation = {base: this.animationCenterScale, target: centerScale, pixXOffset: 0, pixYOffset: 0};
    this.setAnimationCenterScale();
    this.setIncubationCenterScale();
}

FocusModel.prototype.setAnimationCenterScale = function() {
    this.animationTimer.reset();
    this.animationTimer.start();
}

FocusModel.prototype.setIncubationCenterScale = function() {
    this.incubationTimer.reset();
    this.incubationTimer.start();
}

// Center-related conditions. Relevant for zooming and panning.
FocusModel.prototype.centercon = function(centerScale) {
    var centerX = Math.min(Math.max(centerScale.centerX, this.srs.minX), this.srs.maxX);
    var centerY = Math.min(Math.max(centerScale.centerY, this.srs.minY), this.srs.maxY);
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
        var zoomLevelScale = this.srs.getZoomLevel(centerScale.scale, roundToZoomLevels).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    return centerScale;
}

