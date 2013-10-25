function FocusModel() {
    this.timer = null;
    this.minScale = -1;
    this.maxScale = -1;
    this.scaleToZoomLevels = false;
    this.centerScale = null;
    this.centerScales = null;
}

FocusModel.prototype.setCenterScale = function(centerScale) {
    centerScale = this.precond(centerScale);
    this.centerScale = centerScale;
}

FocusModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.timer.reset();
    var focusModel = this;
    this.timer.timerHandler = function() {
        focusModel.centerScale = focusModel.centerScales[focusModel.timer.currentCount];
    };
    animationCenterScale = this.precond(animationCenterScale);
    if ((this.centerScale == null) || (this.centerScale.equals(animationCenterScale))) {
        this.centerScale = animationCenterScale;
    } else {
        var dCenterX = (animationCenterScale.centerX - this.centerScale.centerX) / this.timer.numRepeats;
        var dCenterY = (animationCenterScale.centerY - this.centerScale.centerY) / this.timer.numRepeats;
        var dScale = (animationCenterScale.scale - this.centerScale.scale) / this.timer.numRepeats;
        this.centerScales = [];
        for (var i = 0; i < this.timer.numRepeats; i++) {
            this.centerScales.push(new CenterScale(
                this.centerScale.centerX + (-dCenterX / this.timer.numRepeats * i * i + (dCenterX + dCenterX) * i),
                this.centerScale.centerY + (-dCenterY / this.timer.numRepeats * i * i + (dCenterY + dCenterY) * i),
                this.centerScale.scale + (-dScale / this.timer.numRepeats * i * i + (dScale + dScale) * i)
            ));
        }
        this.centerScales.push(animationCenterScale); // For this one: i == numRepeats
        this.centerScale = this.centerScales[0];  
        this.timer.start();
    }
}

FocusModel.prototype.pan = function(dx, dy) {
    if (this.timer.isRunning()) {
        for (var i = this.timer.currentCount; i <= this.timer.numRepeats; i++) {
            this.centerScales[i] = new CenterScale(this.centerScales[i].centerX + dx, this.centerScales[i].centerY + dy, this.centerScales[i].scale);
        }
    } else {
        this.centerScale = new CenterScale(this.centerScale.centerX + dx, this.centerScale.centerY + dy, this.centerScale.scale);
    }
}

FocusModel.prototype.precond = function(centerScale) {
    var centerX = centerScale.centerX;
    var centerY = centerScale.centerY;
    var scale = centerScale.scale;
    
    if ((this.minScale > -1) && (scale < this.minScale)) {
        return this.precond(new CenterScale(centerX, centerY, this.minScale));
    }
    if ((this.maxScale > -1) && (scale > this.maxScale)) {
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

