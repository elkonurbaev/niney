function EnvelopeModel(boundsModel, focusModel) {
    this.boundsModel = boundsModel;
    this.focusModel = focusModel;
    
    this.bounds = null;
    this.centerScale = null;
    this.animationCenterScale = null;
    
    this.envelope = null;
    this.animationEnvelope = null;
}

EnvelopeModel.prototype.getEnvelope = function() {
    var bounds = this.boundsModel.bounds;
    var centerScale = this.focusModel.centerScale;
    
    if (this.bounds != bounds) {
        this.bounds = bounds;
        this.envelope = null;
        this.animationEnvelope = null;
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

