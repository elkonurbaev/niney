function EnvelopeCenterScale() {
    this.centerX = -1;
    this.centerY = -1;
    this.scale = -1;
    
    this.width = -1;
    this.height = -1;
    this.envelope = null;
}

EnvelopeCenterScale.prototype = new CenterScale();
EnvelopeCenterScale.prototype.constructor = EnvelopeCenterScale;

EnvelopeCenterScale.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    this.width = bounds.width;
    this.height = bounds.height;
    this.envelope = this.toEnvelope(this.width, this.height);
}

EnvelopeCenterScale.prototype.setCenterScale = function(centerScale) {
    if (centerScale == null) {
        return;
    }
    this.centerX = centerScale.centerX;
    this.centerY = centerScale.centerY;
    this.scale = centerScale.scale;
    this.envelope = this.toEnvelope(this.width, this.height);
}

EnvelopeCenterScale.prototype.equals = function(centerScale) {
    if (centerScale == null) {
        return false;
    }
    if (centerScale instanceof EnvelopeCenterScale) {
        return (
            (this.centerX == centerScale.centerX) && (this.centerY == centerScale.centerY) &&
            (this.scale == centerScale.scale) &&
            (this.width == centerScale.width) && (this.height == centerScale.height)
        );
    }
    return (
        (this.centerX == centerScale.centerX) && (this.centerY == centerScale.centerY) &&
        (this.scale == centerScale.scale)
    );
}

