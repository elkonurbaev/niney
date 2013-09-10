angular.module('test-app', ['nine-e']).
    factory('boundsScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        var model = new BoundsModel();
        var timer = new Timer(2000, -1);
        timer.scope = scope;
        timer.timerHandler = function() {
            var map = document.getElementById("map");
            var style = map.currentStyle || getComputedStyle(map, null);
            var width = style.width.replace("px", "");
            var height = style.height.replace("px", "");
            model.bounds = new Bounds(width, height);
        };
        scope.timer = timer;
        scope.model = model;
        return scope;
    }]).
    factory('focusScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        var model = new FocusModel();
        var timer = new Timer(50, 20);
        timer.scope = scope;
        model.timer = timer;
        scope.model = model;
        return scope;
    }]).
    factory('layerScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        var layers = [
    	{id:1, title:'Hinder en afsluitingen', visible:false},
    	{id:2, title:'Treinstations', visible:false},
    	{id:3, title:'OV-fietslocaties', visible:false},
    	{id:4, title:'P&R-plaatsen', visible:false},
    	{id:5, title:'Carpoolplaatsen', visible:false},
    	{id:6, title:'Parkeren in het centrum', visible:false},
    	{id:7, title:'Filemeldingen', visible:false},
    	{id:8, title:'Buienradar', visible:false}
  		];
        scope.layers = layers;
        return scope;
    }]).
    factory('serviceScope', ['$rootScope', function($rootScope) {
  	   var scope = $rootScope.$new();
  	   var features = [
        {id:1, url:'twentemobiel/trains.csv', featureName:'trainFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING)))}/*,
    	{id:2, url:'twentemobiel/bikes.csv', featureName:'bikesFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.GEOMETRY), new Property('d', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('h', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('k', PropertyType.prototype.STRING), new Property('l', PropertyType.prototype.STRING), new Property('n', PropertyType.prototype.STRING), new Property('m', PropertyType.prototype.STRING), new Property('o', PropertyType.prototype.STRING), new Property('p', PropertyType.prototype.STRING), new Property('r', PropertyType.prototype.STRING)))},
    	{id:3, url:'twentemobiel/parkrides.csv', featureName:'parkridesFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY)))},
    	{id:4, url:'twentemobiel/carpools.csv', featureName:'carpoolsFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY)))},
    	{id:5, url:'twentemobiel/carparks.csv', featureName:'carparksFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY)))},
    	{id:6, url:'twentemobiel/webcams.csv', featureName:'webcamsFeature', featureType:new FeatureType('trainFeature', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))}*/
       ];
       scope.features = features;
       return scope;
    }]).
    factory('tileScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        scope.model = new TileModel();
        return scope;
    }]).
    run(['$rootScope', 'boundsScope', 'focusScope', 'tileScope', function($rootScope, boundsScope, focusScope, tileScope) {
        var tileModel = tileScope.model;
        
        boundsScope.$watch('model.bounds', function(newValue, oldValue) { tileModel.setBounds(boundsScope.model.bounds); });
        focusScope.$watch('model.centerScale', function(newValue, oldValue) { tileModel.setCenterScale(focusScope.model.centerScale); });
        
        boundsScope.timer.tick();
        boundsScope.timer.start();
        focusScope.model.centerScale = new CenterScale(0, 3000000, 110936068.18103503);
    }]).
    controller('MapCtrl', ['$scope', 'boundsScope', 'focusScope', 'tileScope', 'layerScope', function ($scope, boundsScope, focusScope, tileScope, layerScope) {
        $scope.boundsModel = boundsScope.model;
        $scope.focusModel = focusScope.model;
        $scope.tileModel = tileScope.model;
        $scope.layers = layerScope.layers;
    }]).
    controller('FocusButtonBarCtrl', ['$scope', 'focusScope', function ($scope, focusScope) {
        var focusModel = focusScope.model;
        
        $scope.panWest = function() {
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX - 3000000, cs.centerY, cs.scale));
        }
        $scope.panEast = function() {
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX + 3000000, cs.centerY, cs.scale));
        }
        $scope.zoomIn = function() {
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / 2));
        }
        $scope.zoomOut = function() {
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale * 2));
        }
    }]).
    controller('FocusPanelCtrl', ['$scope', 'focusScope', function ($scope, focusScope) {
        $scope.focusModel = focusScope.model;
    }]).
    controller('LegendCtrl', ['$scope', 'layerScope', function ($scope, layerScope) {
        $scope.layers = layerScope.layers;
    }]).
    controller('ServiceCtrl',  function ($scope, $http, serviceScope) {
    	$scope.features = serviceScope.features;
    	var featureModels = new Array();
    	for(var i = 0; i < $scope.features.length; ++i){
    		var serviceConnector = new CSVServiceConnector($http, $scope.features[i].featureType, $scope.features[i].url);
    		var features = serviceConnector.load();
    		var featureModel = new FeatureModel(features, $scope.features[i].featureType);
    		featureModels.push(featureModel);
    	}
    	
	});

function setMapSize(width, height) {
    var mapStyle = document.getElementById("map").style;
    mapStyle.width = width + "px";
    mapStyle.height = height + "px";
}
