angular.module('nine-e', ['monospaced.mousewheel']).
    directive('map', function factory($document) {
        var directiveDefinitionObject = {
            template: '<div class="mapviewer" ng-mousedown="mouseDownHandler($event)" msd-wheel="mouseWheelHandler($event, $delta)" ng-transclude/>',
            replace: true,
            restrict: 'E',
            scope: {
                focusModel: '=focusmodel'
            },
            controller: ["$scope", function($scope) {
                $scope.mouseDownX = -1;
                $scope.mouseDownY = -1;
                $scope.panning = false;
                
                $scope.mouseDownHandler = function(mouseEvent) {
                    $scope.mouseDownX = mouseEvent.pageX; // (mouseEvent.pageX - mouseEvent.currentTarget.offsetLeft)
                    $scope.mouseDownY = mouseEvent.pageY; // (mouseEvent.pageY - mouseEvent.currentTarget.offsetTop)
                    
                    $document.on("mousemove", mouseMoveHandler1);
                    $document.on("mouseup", mouseUpHandler);
                    
                    mouseEvent.preventDefault();
                }
                
                function mouseMoveHandler1(mouseEvent) {
                    var centerScale = $scope.focusModel.centerScale;
                    var dx = centerScale.getNumWorldCoords(mouseEvent.pageX - $scope.mouseDownX);
                    var dy = centerScale.getNumWorldCoords(mouseEvent.pageY - $scope.mouseDownY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    $scope.mouseDownX = mouseEvent.pageX;
                    $scope.mouseDownY = mouseEvent.pageY;
                }
                
                function mouseUpHandler(mouseEvent) {
                    $document.off("mousemove", mouseMoveHandler1);
                    $document.off("mouseup", mouseUpHandler);

                    $scope.mouseDownX = -1;
                    $scope.mouseDownY = -1;
                }
                
                $scope.mouseWheelHandler = function(mouseEvent, delta) {
                    var cs = $scope.focusModel.centerScale;
                    $scope.focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / Math.pow(2, delta)));
                    
                    mouseEvent.preventDefault();
                };
            }],
            transclude: true
        };
        return directiveDefinitionObject;
    }).
    directive('tileslayer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="tileslayer"><img ng-repeat="tile in tileModel.tiles" src="{{tileModel.urlBase + tile.url}}" style="position: absolute; opacity: 0.9;" ng-style="tile.toCSS()"/></div>',
            replace: true,
            restrict: 'E',
            scope: {
                tileModel: '=tilemodel'
            }
        };
        return directiveDefinitionObject;
    }).
    directive('legend', function factory() {
        var directiveDefinitionObject = {
            template: '\
            <div>\
  			<ul>\
  				<li ng-repeat="layer in layers">\
          			<input id="layer_{{layer.id}}" type="checkbox" ng-model="layer.visible">\
         			<label for="layer_{{layer.id}}" class="visible-{{layer.visible}}">{{layer.title}}</label>\
        		</li>\
  			</ul>\
  			</div>',
            replace: true,
            restrict: 'E',
            scope: {
                layers: '='
            }
        };
        return directiveDefinitionObject;
    }).	
    directive('mapfeatureslayer', function factory() {
        var directiveDefinitionObject = {
            template: '\
        <div class="mapfeaturelayer" ng-if="layers[featuremodelindex].visible"  ng-init="featureModel=featureModels[featuremodelindex].features">\
        </div>',
            replace: true,
            restrict: 'E',
            scope: {
                featuremodelindex: '='
            },
            link: function (scope, elem, attrs) {
			},
			controller: ['$scope', '$http', 'boundsScope', 'focusScope', 'tileScope', 'layerScope', 'featureScope', function ($scope, $http, boundsScope, focusScope, tileScope, layerScope, featureScope) {
                console.log(featureScope.models);
                //cannot access featureModels array because, it is not ready
                //$scope.featureModels 
                //featureModels[featuremodelindex].features
                
            }]
        };
        return directiveDefinitionObject;
    }).
    directive('symbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '\
        <div class="symbolizer"\
        		<span ng-repeat="feature in featureModel">\
        		<img src="{{asset}}" style="position: absolute; top: {{getY()}}px; left: {{getX()}}px" />\
        		</span>\
        </div>',
            replace: true,
            restrict: 'A',
            scope: {
                propertyindex: '=',
                asset: '='
            },
            link: function (scope, elem, attrs) {
			},
			controller: ['$scope', '$http', 'boundsScope', 'focusScope', 'tileScope', 'layerScope', 'featureScope', function ($scope, $http, boundsScope, focusScope, tileScope, layerScope, featureScope) {
                console.log($scope.asset);
                $scope.getY = function(mouseEvent) {
                	var x = boundsModel.bounds.height;
                	var y  = feature.propertyValues[propertyIndex].y;
					return focusModel.centerScale.getPixY(x, y);
                }
                $scope.getX = function() {
                	var x = boundsModel.bounds.width;
                	var y  = feature.propertyValues[propertyIndex].x;
					return focusModel.centerScale.getPixX(x, y);
                }
            }]
        };
        return directiveDefinitionObject;
    }		
);
