function FocusModel() {
    this.animationTimer = new AnimationTimer(1000);
    this.incubationTimer = new Timer(1000, 1);
    this.maxEnvelope = new Envelope(-20000000, -20000000, 20000000, 20000000);
    this.minScale = 0;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animationBase = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        focusModel.animationCenterScale = focusModel.getAnimationCenterScale();
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
            this.animationBase = {
                centerScale: new CenterScale(x, y, this.animationBase.centerScale.scale),
                pixXOffset: pixXOffset,
                pixYOffset: pixYOffset
            };
        }
        this.setIncubationCenterScale();
    }
}

// Pan with mouse move.
FocusModel.prototype.pan = function(dx, dy, pixXOffset, pixYOffset) {
    if (this.animationTimer.isRunning()) {
        if (this.animationCenterScale.scale == this.centerScale.scale) {
            this.animationTimer.reset();
            this.centerScale = this.animationCenterScale = this.centercon(
                new CenterScale(this.animationCenterScale.centerX + dx, this.animationCenterScale.centerY + dy, this.animationCenterScale.scale)
            );
        } else {
            this.centerScale = this.centercon(
                new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale)
            );
            this.animationBase.pixXOffset = pixXOffset;
            this.animationBase.pixYOffset = pixYOffset;
        }
    } else {
        this.centerScale = this.animationCenterScale = this.centercon(
            new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale)
        );
    }
    this.setIncubationCenterScale();
}

// Zoom with mouse wheel (animate == true) or pan/zoom with touch move/pinch (animate == false).
FocusModel.prototype.zoom = function(centerScale, pixXOffset, pixYOffset, animate) {
    centerScale = this.scalecon(centerScale, animate);
    if (animate && (this.animationCenterScale.scale == centerScale.scale)) {
        return;
    }
    if (!animate && (this.animationTimer.isRunning())) {
        this.animationTimer.reset();
    }
    
    this.centerScale = this.centercon(centerScale.fromOffset(pixXOffset, pixYOffset));
    if (animate) {
        this.animationBase = {
            centerScale: new CenterScale(centerScale.centerX, centerScale.centerY, this.animationCenterScale.scale),
            pixXOffset: pixXOffset,
            pixYOffset: pixYOffset
        };
        this.setAnimationCenterScale();
    } else {
        this.animationCenterScale = this.centerScale;
    }
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
        this.animationBase = {centerScale: centerScale, pixXOffset: 0, pixYOffset: 0};
        this.animationCenterScale = centerScale;
        this.incubationCenterScale = centerScale;
        return;
    }
    if (this.centerScale.equals(centerScale)) {
        return;
    }
    
    this.centerScale = centerScale;
    this.animationBase = {centerScale: this.animationCenterScale, pixXOffset: 0, pixYOffset: 0};
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

FocusModel.prototype.getAnimationCenterScale = function() {
    var pixXOffset = this.animationBase.pixXOffset;
    var pixYOffset = this.animationBase.pixYOffset;
    var base = this.animationBase.centerScale;
    var delta = this.centerScale.toOffset(pixXOffset, pixYOffset).subtract(base);
    var progress = this.animationTimer.currentCount / this.animationTimer.duration;
    
    return new CenterScale(
        base.centerX + (-delta.centerX * progress * progress + 2 * delta.centerX * progress),
        base.centerY + (-delta.centerY * progress * progress + 2 * delta.centerY * progress),
        base.scale + (-delta.scale * progress * progress + 2 * delta.scale * progress)
    ).fromOffset(pixXOffset, pixYOffset);
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

