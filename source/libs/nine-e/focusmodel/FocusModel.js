function FocusModel() {
    this.timer = null;
    this.centerScale = null;
    this.centerScales = null;
}

FocusModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.timer.reset();

    var focusModel = this;
    this.timer.timerHandler = function() {
        focusModel.centerScale = focusModel.centerScales[focusModel.timer.currentCount];
    };
    
    if ((this.centerScale == null)/* || (this.centerScale.equals(animationCenterScale))*/) {
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