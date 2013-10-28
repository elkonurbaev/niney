angular.module('nine-e', ['monospaced.mousewheel']).
    directive('map', function factory($document) {
        var directiveDefinitionObject = {
            template: '<div class="mapviewer" ng-mousedown="mouseDownHandler($event)" msd-wheel="mouseWheelHandler($event, $delta)" ng-transclude/>',
            replace: true,
            restrict: 'E',
            scope: {
                boundsModel: '=boundsmodel',
                focusModel: '=focusmodel',
                envelopeModel: '=envelopemodel'
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
                    $scope.panning = false;
                }
                
                $scope.mouseWheelHandler = function(mouseEvent, delta) {
                    var cs = $scope.focusModel.centerScale;
                    $scope.focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / Math.pow(2, delta)));
                    
                    mouseEvent.preventDefault();
                };
                this.scope = $scope;
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
    directive('mapfeaturelayer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer"/>',
            restrict: 'E',
            require: '^map',
            replace: true,
            transclude: true,
            scope: {
                layer: '=layer',
                featureModel: '=featuremodel'
            },
            controller: ['$scope', function ($scope) {
                this.scope = $scope;
            }],
            compile: function (element, attr, transclude) {
                return function ($scope, $element, $attr, $parentCtrl) {
                    $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                    $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                    $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                    
                    var childElement, childScope;
                    $scope.$watch('layer.visible', function(val) {
                        if (childElement) {
                            $element.contents().remove();
                            childElement = undefined;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = undefined;
                        }
                        if (val) {
                            childScope = $scope.$new();
                            transclude(childScope, function (clone) {
                                childElement = clone;
                                $element.append(clone);
                            });
                        }
                    });
                }
            }
        };
        return directiveDefinitionObject;
    }).
    directive('geometrysymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.centerScale.scale"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="mapfeaturelayer" style="width: {{boundsModel.bounds.width}}px; height: {{boundsModel.bounds.height}}px; pointer-events: none" ng-click="showInfo(feature)" ng-repeat="feature in featureModel.features"><polyline style="pointer-events: visible" ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries" points="{{parsePoints(geometry.points)}}" style="{{style}}"></polyline></svg></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                style: '@style'
            },
            controller: ['$scope', function ($scope) {
                $scope.parsePoints = function(points) {
                    if (points == null) return;
                    var ret = "";
                    var cs = $scope.focusModel.centerScale;
                    var bounds = $scope.boundsModel.bounds;
                    for (var i = 0; i < points.length; i++) {
                        var x = cs.getPixX(bounds.width, points[i].x);
                        var y = cs.getPixY(bounds.height, points[i].y);
                        ret += x + "," + y + " ";
                    }
                    return ret;
                }
                $scope.isInsideBoundaries = function(item){
                	var itemEnvelope = item.getEnvelope();
                	return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.showInfo = function(feature){
                	console.log('showInfo A ' + feature.propertyValues[1]);
                	/*console.log(feature.propertyValues[2]);
                	console.log(feature.propertyValues[4]);
                	console.log(feature.propertyValues[5]);
                	console.log(feature.propertyValues[6]);*/
                	//document.getElementById('infoPanel').append();
                
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    }).
    directive('imagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.centerScale.scale"><img ng-repeat="feature in featureModel.features | filter:isInsideBoundaries" ng-click="showInfo(feature)" src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.centerScale.getPixY(boundsModel.bounds.height, feature.propertyValues[propertyIndex].y)}}px; left: {{focusModel.centerScale.getPixX(boundsModel.bounds.width, feature.propertyValues[propertyIndex].x)}}px"/></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                assetPropertyIndex: '@assetpropertyindex',
                asset: '@asset'
            },
            controller: ['$scope', function ($scope) {
                $scope.isInsideBoundaries = function(item){
                	var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                	return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.showInfo = function(feature) {
                	console.log('showInfo B ' + feature.propertyValues[1]);
                	/*console.log(feature.propertyValues[2]);
                	console.log(feature.propertyValues[4]);
                	console.log(feature.propertyValues[5]);
                	console.log(feature.propertyValues[6]);*/
                	//document.getElementById('infoPanel').append();
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    }).
    directive('geometryimagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.centerScale.scale"><div ng-repeat="feature in featureModel.features" ng-click="showInfo(feature)"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries track by $index" src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.centerScale.getPixY(boundsModel.bounds.height, geometry.y)}}px; left: {{focusModel.centerScale.getPixX(boundsModel.bounds.width, geometry.x)}}px" /></div></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                assetPropertyIndex: '@assetpropertyindex',
                asset: '@asset'
            },
            controller: ['$scope', function ($scope) {
                $scope.isInsideBoundaries = function(item){
                	var itemEnvelope = item.getEnvelope();
                	return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.showInfo = function(feature){
                	console.log('showInfo C ' + feature.propertyValues[0]);
                	/*console.log(feature.propertyValues[2]);
                	console.log(feature.propertyValues[4]);
                	console.log(feature.propertyValues[5]);
                	console.log(feature.propertyValues[6]);*/
                	//window.open(feature.propertyValues[2]);
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    });

