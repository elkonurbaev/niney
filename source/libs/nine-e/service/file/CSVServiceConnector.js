function CSVServiceConnector(http, featureType, url) {
	this.http = http;
    this.fieldSeparator = ";";
    this.textDelimiter = "\"";
    this.featureType = featureType;
    this.url = url;
}

CSVServiceConnector.prototype.load = function(scope, callback){
	var obj = this;
	var csvConverter = new CSVConverter();
	var features = new Array();
	this.http({method: 'GET', url: this.url}).
  	success(function(data, status, headers, config) {
  		features = csvConverter.csvToFeatures(data, obj.fieldSeparator, obj.textDelimiter, obj.featureType);
  		var featureModel = new FeatureModel(features, obj.featureType);
  		scope.featureModels.push(featureModel);
        //callback(featureModel);
  	}).
  	error(function(data, status, headers, config) {
    	alert('error'+status);
  	});	
} 
