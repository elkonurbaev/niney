function Feature(featureType, propertyValues) {
    this.featureType = featureType;
    this.propertyValues = propertyValues;
}

/*Feature.prototype.getProperties = function(){
	for(var i = 0; i < this.propertyValues.length; ++i){
		console.log(this.propertyValues[i]+ ' '+this.featureType.properties[i].type);
	}
}*/