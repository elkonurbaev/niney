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
       var services = [
        {id:1, url:'http://www.wegwerkmeldingen.nl/nine-e/trains.csv', fieldSeparator="\"", textDelimeter=";", type=''},
    	{id:2, url:'http://www.wegwerkmeldingen.nl/nine-e/bikes.csv', fieldSeparator="\"", textDelimeter=";", type=''},
    	{id:3, url:'http://www.wegwerkmeldingen.nl/nine-e/parkrides.csv', fieldSeparator="\"", textDelimeter=";", type=''},
    	{id:4, url:'http://www.wegwerkmeldingen.nl/nine-e/carpools.csv', fieldSeparator="\"", textDelimeter=";", type=''},
    	{id:5, url:'http://www.wegwerkmeldingen.nl/nine-e/carparks.csv', fieldSeparator="\"", textDelimeter=";", type=''},
    	{id:6, url:'http://www.wegwerkmeldingen.nl/nine-e/webcams.csv', fieldSeparator="\"", textDelimeter=";", type=''}
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
    controller('ServiceCtrl',  function ($scope, serviceScope) {
    	$scope.services = serviceScope.services;
	});

function setMapSize(width, height) {
    var mapStyle = document.getElementById("map").style;
    mapStyle.width = width + "px";
    mapStyle.height = height + "px";
}
