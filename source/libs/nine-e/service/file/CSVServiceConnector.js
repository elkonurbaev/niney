function CSVServiceConnector(http, id, fieldSeparator, simple, featureType, url) {
	this.http = http;
	this.id = id;
    this.fieldSeparator = fieldSeparator;
    this.textDelimiter = "\"";
    this.featureType = featureType;
    this.url = url;
    this.simple = simple;
}

CSVServiceConnector.prototype.load = function(scope, callback) {
	var obj = this;
	var csvConverter = new CSVConverter();
	var features = new Array();
	this.http({method: 'GET', url: this.url}).
  	success(function(data, status, headers, config) {
  		features = csvConverter.csvToFeatures(data, obj.simple, obj.fieldSeparator, obj.textDelimiter, obj.featureType);
  		var featureModel = new FeatureModel(features, obj.featureType);
  		callback(scope, obj.id, featureModel);
  	}).
  	error(function(data, status, headers, config) {
    	alert('error'+status);
  	});	
  	
} 
 