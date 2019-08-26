function FocusModel() {
    this.animationTimer = new AnimationTimer(1000);
    this.incubationTimer = new Timer(1000, 1);
    this.srs = new SRS();
    this.maxEnvelope = new Envelope(this.srs.minX, this.srs.minY, this.srs.maxX, this.srs.maxY);
    this.minScale = 846.37503189876580;
    this.maxScale = 443744272.72414012;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.animation = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    var focusModel = this;
    this.animationTimer.timerHandler = function() {
        var progress = focusModel.animationTimer.currentCount / focusModel.animationTimer.duration;
        
        if (progress < 1) {
            var base = focusModel.animation.base;
            var delta = focusModel.animation.target.subtract(base);

            focusModel.animationCenterScale = new CenterScale(
                base.centerX + (-delta.centerX * progress * progress + 2 * delta.centerX * progress),
                base.centerY + (-delta.centerY * progress * progress + 2 * delta.centerY * progress),
                base.scale + (-delta.scale * progress * progress + 2 * delta.scale * progress)
            ).fromOffset(focusModel.animation.pixXOffset, focusModel.animation.pixYOffset);
        } else {
            focusModel.animationCenterScale = focusModel.centerScale;
        }
    };
    this.incubationTimer.timerHandler = function() {
        focusModel.incubationCenterScale = focusModel.centerScale;
    };
}

FocusModel.ALWAYS_LOWER = 0;
FocusModel.ALWAYS_NEAREST = 1;
FocusModel.ALWAYS_UPPER = 2;
FocusModel.IF_REQUIRED_LOWER = 3;
FocusModel.IF_REQUIRED_NEAREST = 4;
FocusModel.IF_REQUIRED_UPPER = 5;
FocusModel.IF_REQUIRED = 6;
FocusModel.NEVER = 7;

// Click or touch while zooming/panning.
FocusModel.prototype.grab = function(x, y, pixXOffset, pixYOffset) {
    var grabbedAnimation = false;
    
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
        
        grabbedAnimation = true;
    }
    
    if (!this.animationTimer.isRunning()) {
        this.animation = {
            base: new CenterScale(x, y, this.centerScale.scale),
            target: this.centerScale.toOffset(pixXOffset, pixYOffset),
            pixXOffset: pixXOffset,
            pixYOffset: pixYOffset
        };
    }
    
    return grabbedAnimation;
}

// Pan with mouse move or one-finger touch.
FocusModel.prototype.pan = function(pixXOffset, pixYOffset) {
    this.animation.pixXOffset = pixXOffset;
    this.animation.pixYOffset = pixYOffset;
}

// Pan/zoom with multi-finger touch.
FocusModel.prototype.pinchPan = function(centerScale, pixXOffset, pixYOffset) {
    centerScale = this.scalecon(centerScale, FocusModel.NEVER);
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
    centerScale = this.scalecon(centerScale, FocusModel.IF_REQUIRED);
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

FocusModel.prototype.setCenterScale = function(centerScale, zoomLevelPolicy) {
    if (centerScale == null) {
        return;
    }
    if (zoomLevelPolicy == null) {
        zoomLevelPolicy = FocusModel.IF_REQUIRED;
    }
    
    centerScale = this.centercon(this.scalecon(centerScale, zoomLevelPolicy));
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
    if (
        (centerScale.centerX < this.maxEnvelope.minX) ||
        (centerScale.centerY < this.maxEnvelope.minY) ||
        (centerScale.centerX > this.maxEnvelope.maxX) ||
        (centerScale.centerY > this.maxEnvelope.maxY)
    ) {
        var centerX = Math.min(Math.max(centerScale.centerX, this.maxEnvelope.minX), this.maxEnvelope.maxX);
        var centerY = Math.min(Math.max(centerScale.centerY, this.maxEnvelope.minY), this.maxEnvelope.maxY);
        return new CenterScale(centerX, centerY, centerScale.scale);
    }
    
    return centerScale;
}

// Scale-related conditions. Relevant for zooming only.
FocusModel.prototype.scalecon = function(centerScale, zoomLevelPolicy) {
    if (centerScale.scale < this.minScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.minScale), zoomLevelPolicy);
    }
    if (centerScale.scale > this.maxScale) {
        return this.scalecon(new CenterScale(centerScale.centerX, centerScale.centerY, this.maxScale), zoomLevelPolicy);
    }
    if (
        ((zoomLevelPolicy >= FocusModel.ALWAYS_LOWER) && (zoomLevelPolicy <= FocusModel.ALWAYS_UPPER)) ||
        ((zoomLevelPolicy >= FocusModel.IF_REQUIRED_LOWER) && (zoomLevelPolicy <= FocusModel.IF_REQUIRED) && this.scaleToZoomLevels)
    ) {
        if (zoomLevelPolicy == FocusModel.IF_REQUIRED) {
            zoomLevelPolicy = undefined;
        } else {
            zoomLevelPolicy = zoomLevelPolicy % 3;
        }
        var zoomLevelScale = this.srs.getZoomLevel(centerScale.scale, zoomLevelPolicy).scale;
        if (centerScale.scale != zoomLevelScale) {
            return new CenterScale(centerScale.centerX, centerScale.centerY, zoomLevelScale);
        }
    }
    
    return centerScale;
}

