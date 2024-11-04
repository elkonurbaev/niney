export function EnvelopeModel(boundsModel, focusModel) {
    this.boundsModel = boundsModel;
    this.focusModel = focusModel;
    
    this.bounds = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    this.incubationCenterScale = null;
    
    this.envelope = null;
    this.animationEnvelope = null;
    this.incubationEnvelope = null;
}

EnvelopeModel.prototype.setEnvelope = function(envelope) {
    var bounds = this.boundsModel.bounds;
    var centerScale = this.focusModel.centerScale;
    
    var centerX = envelope.minX + envelope.getWidth() / 2;
    var centerY = envelope.minY + envelope.getHeight() / 2;
    var scale = Math.max(envelope.getWidth() / bounds.width, envelope.getHeight() / bounds.height) / centerScale.coordPixFactor * 1.05;
    this.focusModel.setCenterScale(new CenterScale(centerX, centerY, scale), FocusModel.IF_REQUIRED_UPPER);
}

EnvelopeModel.prototype.getEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var centerScale = this.focusModel.centerScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
        this.incubationEnvelope = null;
    }
    if (this.centerScale != centerScale) {
        this.centerScale = centerScale;
        this.envelope = null;
    }
    
    if ((this.envelope == null) && (bounds != null) && (centerScale != null)) {
        this.envelope = centerScale.toEnvelope(bounds.width, bounds.height);
    }
    
    return this.envelope;
}

EnvelopeModel.prototype.getAnimationEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var animationCenterScale = this.focusModel.animationCenterScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
        this.incubationEnvelope = null;
    }
    if (this.animationCenterScale != animationCenterScale) {
        this.animationCenterScale = animationCenterScale;
        this.animationEnvelope = null;
    }
    
    if ((this.animationEnvelope == null) && (bounds != null) && (animationCenterScale != null)) {
        this.animationEnvelope = animationCenterScale.toEnvelope(bounds.width, bounds.height);
    }
    
    return this.animationEnvelope;
}

EnvelopeModel.prototype.getIncubationEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var incubationCenterScale = this.focusModel.incubationCenterScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
        this.incubationEnvelope = null;
    }
    if (this.incubtionCenterScale != incubationCenterScale) {
        this.incubationCenterScale = incubationCenterScale;
        this.incubationEnvelope = null;
    }
    
    if ((this.incubationEnvelope == null) && (bounds != null) && (incubationCenterScale != null)) {
        this.incubationEnvelope = incubationCenterScale.toEnvelope(bounds.width, bounds.height);
    }
    
    return this.incubationEnvelope;
}

