/* angular */
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
        model.minScale = 1692.7500637975315;
        model.maxScale = 866688.0326643360;
        model.scaleToZoomLevels = true;
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
    	{id:7, title:'Webcams', visible:false}
  		];
        scope.layers = layers;
        return scope;
    }]).
    factory('serviceScope', ['$rootScope', function($rootScope) {
  	   var scope = $rootScope.$new();
  	   var services = [
  	   {id:1, url:'twentemobiel/objects.csv', fieldSeparator:'|', simple:true, featureName:'hinderFeatureModel', featureType:new FeatureType('hinderFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.GEOMETRY), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('h', PropertyType.prototype.STRING), new Property('j', PropertyType.prototype.STRING), new Property('k', PropertyType.prototype.STRING), new Property('l', PropertyType.prototype.STRING)))},
        {id:2, url:'http://www.interstateplanning.nl/trains.csv', fieldSeparator:';', simple:false, featureName:'trainFeatureModel', featureType:new FeatureType('trainFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.STRING), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING)))},
    	{id:3, url:'twentemobiel/bikes.csv', fieldSeparator:';', simple:false, featureName:'bikesFeatureModel', featureType:new FeatureType('bikesFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.GEOMETRY), new Property('d', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('h', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('k', PropertyType.prototype.STRING), new Property('l', PropertyType.prototype.STRING)))},
    	{id:4, url:'twentemobiel/parkrides.csv', fieldSeparator:';', simple:false, featureName:'parkridesFeatureModel', featureType:new FeatureType('parkridesFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
    	{id:5, url:'twentemobiel/carpools.csv', fieldSeparator:';', simple:false, featureName:'carpoolsFeatureModel', featureType:new FeatureType('carpoolsFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
    	{id:6, url:'twentemobiel/carparks.csv', fieldSeparator:';', simple:false, featureName:'carparksFeatureModel', featureType:new FeatureType('carparksFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
    	{id:7, url:'twentemobiel/webcams.csv', fieldSeparator:';', simple:false, featureName:'webcamsFeatureModel', featureType:new FeatureType('webcamsFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))}
       ];
       scope.services = services;
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
        focusScope.model.setCenterScale(new CenterScale(745000, 6856000, 433344.01633216810));
    }]).
    controller('MapCtrl', ['$scope', '$http', 'boundsScope', 'focusScope', 'tileScope', 'layerScope', 'serviceScope', function ($scope, $http, boundsScope, focusScope, tileScope, layerScope, serviceScope) {
        $scope.boundsModel = boundsScope.model;
        $scope.focusModel = focusScope.model;
        $scope.tileModel = tileScope.model;
        $scope.layers = layerScope.layers;
        $scope.featureModels = new Array();

    	var services = serviceScope.services;
    	for(var i = 0; i < services.length; ++i){
    		var serviceConnector = new CSVServiceConnector($http, services[i].id, services[i].fieldSeparator, services[i].simple, services[i].featureType, services[i].url);
    		serviceConnector.load($scope, didFinishLoadingFeatureModels);
    	}
    }]).
    controller('FocusButtonBarCtrl', ['$scope', 'boundsScope', 'focusScope', function ($scope, boundsScope, focusScope) {
        var boundsModel = boundsScope.model;
        var focusModel = focusScope.model;
        
        $scope.panNorth = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY + cs.getNumWorldCoords(bounds.height / 2), cs.scale));
        }
        $scope.panSouth = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY - cs.getNumWorldCoords(bounds.height / 2), cs.scale));
        }
        $scope.panWest = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX - cs.getNumWorldCoords(bounds.width / 2), cs.centerY, cs.scale));
        }
        $scope.panEast = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setAnimationCenterScale(new CenterScale(cs.centerX + cs.getNumWorldCoords(bounds.width / 2), cs.centerY, cs.scale));
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
    });

function setMapSize(width, height) {
    var mapStyle = document.getElementById("map").style;
    mapStyle.width = width + "px";
    mapStyle.height = height + "px";
}

function didFinishLoadingFeatureModels(featureModel){
    
}
