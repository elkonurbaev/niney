/* angular */
angular.module('twente-app', ['nine-e', 'ngSanitize']).
    factory('boundsScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        var model = new BoundsModel();
        var timer = new Timer(50, -1);
        timer.scope = scope;
        timer.timerHandler = function() {
            var map = document.getElementById("map");
            var style = map.currentStyle || getComputedStyle(map, null);
            var width = style.width.replace("px", "");
            var height = style.height.replace("px", "");
            model.setBounds(new Bounds(width, height));
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
        scope.model = model;
        return scope;
    }]).
    factory('envelopeScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        var model = new EnvelopeCenterScale();
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
    factory('featureScope', ['$rootScope', '$http', function($rootScope, $http) {
        var scope = $rootScope.$new();
        var services = [
        {id:1, url:'twentemobiel/objects.csv', fieldSeparator:'|', simple:true, featureName:'hinderFeatureModel', featureType:new FeatureType('hinderFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.GEOMETRY), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.GEOMETRY), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('h', PropertyType.prototype.STRING), new Property('j', PropertyType.prototype.STRING), new Property('k', PropertyType.prototype.STRING), new Property('l', PropertyType.prototype.STRING)))},
        {id:2, url:'twentemobiel/trains.csv', fieldSeparator:';', simple:false, featureName:'trainFeatureModel', featureType:new FeatureType('trainFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY), new Property('e', PropertyType.prototype.STRING), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING)))},
        {id:3, url:'twentemobiel/bikes.csv', fieldSeparator:';', simple:false, featureName:'bikesFeatureModel', featureType:new FeatureType('bikesFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.GEOMETRY), new Property('d', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('f', PropertyType.prototype.STRING), new Property('g', PropertyType.prototype.STRING), new Property('h', PropertyType.prototype.STRING), new Property('e', PropertyType.prototype.STRING), new Property('k', PropertyType.prototype.STRING), new Property('l', PropertyType.prototype.STRING)))},
        {id:4, url:'twentemobiel/parkrides.csv', fieldSeparator:';', simple:false, featureName:'parkridesFeatureModel', featureType:new FeatureType('parkridesFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
        {id:5, url:'twentemobiel/carpools.csv', fieldSeparator:';', simple:false, featureName:'carpoolsFeatureModel', featureType:new FeatureType('carpoolsFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
        {id:6, url:'twentemobiel/carparks.csv', fieldSeparator:';', simple:false, featureName:'carparksFeatureModel', featureType:new FeatureType('carparksFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))},
        {id:7, url:'twentemobiel/webcams.csv', fieldSeparator:';', simple:false, featureName:'webcamsFeatureModel', featureType:new FeatureType('webcamsFeatureModel', new Array(new Property('a', PropertyType.prototype.STRING), new Property('b', PropertyType.prototype.STRING), new Property('c', PropertyType.prototype.STRING), new Property('d', PropertyType.prototype.GEOMETRY)))}
        ];
        scope.models = new Array(services.length);
        for (var i = 0; i < services.length; ++i) {
            var serviceConnector = new CSVServiceConnector($http, services[i].id, services[i].fieldSeparator, services[i].simple, services[i].featureType, services[i].url);
            serviceConnector.load(scope, function(scope, id, featureModel) { 
                scope.models[id] = featureModel; 
            });
        }
        return scope;
    }]).
    factory('selectionScope', ['$rootScope', function($rootScope) {
        var scope = $rootScope.$new();
        scope.model = new SelectionModel();
        scope.model.selectedFeatures = [null, null]; // [0] is the mouseover feature, [1] is the selected feature. Each one causes a highlight in the map, but only [1] actives the info panel.
        return scope;
    }]).
    run(['boundsScope', 'focusScope', 'envelopeScope', function(boundsScope, focusScope, envelopeScope) {
        boundsScope.$watch('model.bounds', function(val) {             
            envelopeScope.model.setBounds(val);
        });
        focusScope.$watch('model.animationCenterScale', function(val) { 
            envelopeScope.model.setCenterScale(val); 
        });
        
        boundsScope.timer.tick();
        boundsScope.timer.start();
        focusScope.model.setCenterScale(new CenterScale(745000, 6856000, 433344.01633216810), 0, 0);
    }]).
    controller('MapCtrl', ['$scope', 'boundsScope', 'focusScope', 'envelopeScope', 'selectionScope', 'layerScope', 'featureScope', function ($scope, boundsScope, focusScope, envelopeScope, selectionScope, layerScope, featureScope) {
        $scope.boundsModel = boundsScope.model;
        $scope.focusModel = focusScope.model;
        $scope.envelopeModel = envelopeScope.model;
        $scope.selectionModel = selectionScope.model;
        $scope.layers = layerScope.layers;
        $scope.featureModels = featureScope.models;
        
        $scope.toggleSelect0FeatureCommand = new ToggleSelectFeatureCommand($scope.selectionModel, 0);
        $scope.toggleSelect1FeatureCommand = new ToggleSelectFeatureCommand($scope.selectionModel, 1);
        $scope.toURLFeatureCommand = new ToURLFeatureCommand();
        
        $scope.selectCommands = [$scope.toggleSelect0FeatureCommand, $scope.toggleSelect0FeatureCommand, $scope.toggleSelect1FeatureCommand];
        $scope.urlCommands = [$scope.toggleSelect0FeatureCommand, $scope.toggleSelect0FeatureCommand, $scope.toURLFeatureCommand];
    }]).
    controller('FocusButtonBarCtrl', ['$scope', 'boundsScope', 'focusScope', function ($scope, boundsScope, focusScope) {
        var boundsModel = boundsScope.model;
        var focusModel = focusScope.model;
        
        $scope.panNorth = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX, cs.centerY + cs.getNumWorldCoords(bounds.height / 2), cs.scale), 0, 0);
        }
        $scope.panSouth = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX, cs.centerY - cs.getNumWorldCoords(bounds.height / 2), cs.scale), 0, 0);
        }
        $scope.panWest = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX - cs.getNumWorldCoords(bounds.width / 2), cs.centerY, cs.scale), 0, 0);
        }
        $scope.panEast = function() {
            var bounds = boundsModel.bounds;
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX + cs.getNumWorldCoords(bounds.width / 2), cs.centerY, cs.scale), 0, 0);
        }
        $scope.zoomIn = function() {
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / 2), 0, 0);
        }
        $scope.zoomOut = function() {
            var cs = focusModel.centerScale;
            focusModel.setCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale * 2), 0, 0);
        }
    }]).
    controller('FocusPanelCtrl', ['$scope', 'focusScope', function ($scope, focusScope) {
        $scope.focusModel = focusScope.model;
    }]).
    controller('InfoCtrl', ['$scope', 'layerScope', 'featureScope', 'selectionScope', function ($scope, layerScope, featureScope, selectionScope) {
        $scope.layers = layerScope.layers;
        $scope.featureModels = featureScope.models;
        $scope.selectionModel = selectionScope.model;
        $scope.setWegobjectText = function(propertyValues) {
        	var typeText = "";
			switch(propertyValues[0]) {
				case '1': typeText = "Hinder door wegwerkzaamheden"; break;
				case '2': typeText = "Afsluiting vanwege wegwerkzaamheden"; break;
				case '3': typeText = "Hinder door evenement"; break;
				case '4': typeText = "Afsluiting vanwege evenement"; break;
				case '5': typeText = "Hinder door calamiteit"; break;
				case '6': typeText = "Afsluiting vanwege calamiteit"; break;
				default: return;
			}
			var text = "";
			text += "<p class='heading'>" + typeText + "</p>";
			text += "<p class='heading'>" + propertyValues[7] + "</p>";
			text += "<p>" + propertyValues[6] + "</p>";
			text += "<p>Waar</p>";
			text += "<p>" + propertyValues[9] + "</p>";
			text += "<p>Wanneer</p>";
			text += "<p>" + propertyValues[1] + "</p>";
			text += "<p>Meer informatie</p>";
			if(propertyValues[8] != null) {
				text += "<p>" + propertyValues[8] + "</p>";
			}
			text += "<p><a href='http://www.twentebereikbaar.nl/pdf/maakpdf.php?Objectnummer=" + propertyValues[5] + "&regio=1'>Download als pdf</a></p>";
			
			text = text.replace(/null/g, "");
			text = text.replace(/\[link\](.*?)\n*?\[text\](.*?)\[end\]/g, "<a href='$1'>$2</a>");
			text = text.replace(/\[7C\]/g, "|");
			text = text.replace(/\[0A\]/g, "<br/>");
			return text;
        }
        $scope.setTrainText = function(propertyValues) {
        	var text = "";
			text += "<p class='heading'>Treinstation</p>";
			text += "<p class='heading'>" + propertyValues[1] + "</p>";
			text += "<p><a href='" + propertyValues[2] + "'>Voorzieningen op het station</a></p>";
			text += "<p><a href='" + propertyValues[4] + "'>Plan een reis vanaf dit station</a></p>";
			text += "<p><a href='" + propertyValues[5] + "'>Plan een reis naar dit station</a></p>";
			text += "<p><a href='" + propertyValues[6] + "'>Actuele vertrektijden</a></p>";
			return text;
        }
        $scope.setBikeText = function(propertyValues) {
        	var text = "";
			text += "<p class='heading'>OV-fietslocatie</p>";
			text += "<p class='heading'>" + propertyValues[3] + "</p>";
			if (propertyValues[4] != null) {
				text += "<p>" + propertyValues[4] + "</p>";
			}
			if (propertyValues[5] != null) {
				text += "<p>" + propertyValues[5] + "</p>";
			}
			if (propertyValues[6] != null) {
				text += "<p>" + propertyValues[6] + " " + propertyValues[7] + "</p>";
			}
			text += "<p>Openingstijden</p>";
			text += "<p>" + propertyValues[8] + "</p>";
			if (propertyValues[9] != null) {
				text += "<p>Bijzonderheden</p>";
				text += "<p>" + propertyValues[9] + "</p>";
			}
			text += "<p><a href='" + propertyValues[10] + "'>Plan een fietsroute vanaf hier</a></p>";
			text += "<p><a href='" + propertyValues[1] + "'>Meer informatie</a></p>";
			return text;
        }
    }]);

function setMapSize(width, height) {
    var mapStyle = document.getElementById("map").style;
    mapStyle.width = width + "px";
    mapStyle.height = height + "px";
}

