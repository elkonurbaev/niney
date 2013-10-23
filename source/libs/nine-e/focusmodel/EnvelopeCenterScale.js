function EnvelopeCenterScale() {
	this.envelope = null;
	this.width = -1;
	this.height = -1;
	this.centerX = -1;
	this.centerY = -1;
	this.scale = -1;
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

EnvelopeCenterScale.prototype.getEnvelope = function(){
	return this.envelope;
}

EnvelopeCenterScale.prototype.getWidth = function(){
	return this.width;
}

EnvelopeCenterScale.prototype.getHeight = function(){
	return this.height;
}

EnvelopeCenterScale.prototype.equals = function(centerScale){
	if(centerScale == null){
		return false;
	}
	if(centerScale instanceof EnvelopeCenterScale){
		if((this.centerX = centerScale.getCenterX()) &&
			(this.centerY == centerScale.getCenterY()) &&
			(this.scale == centerScale.getScale()) &&
			(this.width == centerScale.getWidth()) &&
			(this.height == centerScale.getHeight())
		   ){
			return true;
		}
		else{
			return false;
		}
	}
	return this.equals(centerScale);
}
			
	
