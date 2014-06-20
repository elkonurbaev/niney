angular.module('nine-e', ['monospaced.mousewheel']).
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
    directive("map", ["$document", function factory($document) {
        return {
            template: '<div class="mapviewer" ng-mousedown="mouseDownHandler($event)" msd-wheel="mouseWheelHandler($event, $delta)" ng-transclude/>',
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=boundsmodel",
                focusModel: "=focusmodel",
                envelopeModel: "=envelopemodel"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            link: function($scope, $element, $attr) {
                $scope.mouseX = -1;
                $scope.mouseY = -1;
                $scope.mouseDownX = -1;
                $scope.mouseDownY = -1;
                
                $document.on("mousemove", mouseMoveHandler);
                
                function mouseMoveHandler(mouseEvent) {
                    $scope.mouseX = mouseEvent.pageX - $element[0].offsetLeft;
                    $scope.mouseY = mouseEvent.pageY - $element[0].offsetTop;
                }
                
                $scope.mouseDownHandler = function(mouseEvent) {
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, $scope.mouseX);
                    var worldY = cs.getWorldY(height, $scope.mouseY);
                    
                    var pixXOffset = $scope.mouseX - (width / 2);
                    var pixYOffset = $scope.mouseY - (height / 2);
                    
                    $scope.focusModel.bazoo(worldX, worldY, pixXOffset, pixYOffset);
                    
                    $scope.mouseDownX = $scope.mouseX;
                    $scope.mouseDownY = $scope.mouseY;
                    
                    $document.on("mousemove", mouseMoveHandler1);
                    $document.on("mouseup", mouseUpHandler);
                    
                    mouseEvent.preventDefault();
                };
                
                function mouseMoveHandler1(mouseEvent) {
                    var cs = $scope.focusModel.animationCenterScale;
                    var dx = cs.getNumWorldCoords($scope.mouseX - $scope.mouseDownX);
                    var dy = cs.getNumWorldCoords($scope.mouseY - $scope.mouseDownY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    $scope.mouseDownX = $scope.mouseX;
                    $scope.mouseDownY = $scope.mouseY;
                }
                
                function mouseUpHandler(mouseEvent) {
                    $document.off("mousemove", mouseMoveHandler1);
                    $document.off("mouseup", mouseUpHandler);

                    $scope.mouseDownX = -1;
                    $scope.mouseDownY = -1;
                }
                
                $scope.mouseWheelHandler = function(mouseEvent, delta) {
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, $scope.mouseX);
                    var worldY = cs.getWorldY(height, $scope.mouseY);
                    var scale = cs.scale;
                    
                    if (delta > 0) {
                        scale /= 2;
                    } else {
                        scale *= 2;
                    }
                    var pixXOffset = $scope.mouseX - (width / 2);
                    var pixYOffset = $scope.mouseY - (height / 2);
                    
                    $scope.focusModel.setCenterScale(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
                    
                    mouseEvent.preventDefault();
                };
            }
        };
    }]).
    directive("tileslayer", function factory() {
        return {
            template: '<div class="tileslayer"><img ng-repeat="tile in tileModel.tiles" ng-src="{{tileModel.urlBase + tile.url}}" style="position: absolute; opacity: 0.9;" ng-style="tile.toCSS()"/></div>',
            restrict: "E",
            require: "^map",
            replace: true,
            link: function ($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
            }
        };
    }).
    directive("wmslayer", function factory() {
        return {
            template: '<div class="wmslayer"><img src="{{wmsModel.tile.url}}" style="position: absolute; opacity: 0.6;" ng-style="wmsModel.tile.toCSS()" ng-show="wmsModel.tile.completed" maploader/></div>',
            restrict: "E",
            require: "^map",
            replace: true,
            link: function ($scope, $element, $attr, $parentCtrl) {
                $scope.wmsModel = new WMSModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.wmsModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.wmsModel.setAnimationCenterScale(val); });
                $scope.$watch("focusModel.incubationCenterScale", function(val) { $scope.wmsModel.setCenterScale(val); });
            }
        };
    }).
    directive("maploader", function() {
        return {
            restrict: "A",
            link: function($scope, $element, $attrs) {
                $element.on("load", function() { $scope.wmsModel.tile.completed = true; });
                $element.on("error", function() { $scope.wmsModel.tile.completed = true; });
            }
        };
    }).
    directive("mapfeaturelayer", function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer"/>',
            restrict: 'E',
            require: '^map',
            replace: true,
            transclude: true,
            scope: {
                layer: '=layer',
                featureModel: '=featuremodel',
                selectionModel: '=selectionmodel',
                featureCommands: '=featurecommands'
            },
            controller: ["$scope", function ($scope) {
                this.scope = $scope;
            }],
            compile: function (element, attr, transclude) {
                return function ($scope, $element, $attr, $parentCtrl) {
                    $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                    $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                    $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                    var childElement, childScope;
                    $scope.$watch("layer.visible", function(val) {
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
    directive("geometrysymbolizer", function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.animationCenterScale.scale"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="mapfeaturelayer" style="width: {{boundsModel.bounds.width}}px; height: {{boundsModel.bounds.height}}px; pointer-events: none" ng-repeat="feature in featureModel.features"><polyline style="pointer-events: visible" ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries" points="{{parsePoints(geometry.points)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="getStyle(feature)"></polyline></svg></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                style: '@style'
            },
            controller: ["$scope", function ($scope) {
                var scope = $scope;
                $scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return "highlightGeometrySymbolizer";
                        }
                    }
                    return "defaultGeometrySymbolizer";
                }
                /*$scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return scope.highStyle;
                        }
                    }
                    return scope.lowStyle;
                }*/
                $scope.parsePoints = function(points) {
                    if (points == null) return;
                    var ret = "";
                    var cs = $scope.focusModel.animationCenterScale;
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
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('selectionModel', function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch('featureCommands', function(val) { $scope.featureCommands = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
                /*$attr.$observe('style', function(val) { $scope.lowStyle = angular.extend({}, val); $scope.highStyle = angular.extend({}, val); $scope.highStyle.strokeWidth = 7; });*/
            }
        };
        return directiveDefinitionObject;
    }).
    directive('imagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in featureModel.features | filter:isInsideBoundaries" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="getStyle(feature)" src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.animationCenterScale.getPixY(boundsModel.bounds.height, feature.propertyValues[propertyIndex].y)}}px; left: {{focusModel.animationCenterScale.getPixX(boundsModel.bounds.width, feature.propertyValues[propertyIndex].x)}}px"/></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                assetPropertyIndex: '@assetpropertyindex',
                asset: '@asset',
                style: '@style'
            },
            controller: ['$scope', function($scope){
                var scope = $scope;
                $scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return "highlightSymbolizer";
                        }
                    }
                    return "defaultSymbolizer";
                }
                /*$scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return scope.highStyle;
                        }
                    }
                    return scope.lowStyle;
                }*/
                $scope.isInsideBoundaries = function(item) {
                    var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                   $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('selectionModel', function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch('featureCommands', function(val) { $scope.featureCommands = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
                /*$attr.$observe('style', function(val) { $scope.lowStyle = angular.extend({}, val); $scope.highStyle = angular.extend({}, val); $scope.highStyle.strokeWidth = 7; });*/
            }
        };
        return directiveDefinitionObject;
    }).
    directive('geometryimagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.animationCenterScale.scale"><div ng-repeat="feature in featureModel.features"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries track by $index" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="getStyle(feature)" src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.animationCenterScale.getPixY(boundsModel.bounds.height, geometry.y)}}px; left: {{focusModel.animationCenterScale.getPixX(boundsModel.bounds.width, geometry.x)}}px" /></div></div>',
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
                var scope = $scope;
                $scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return "highlightSymbolizer";
                        }
                    }
                    return "defaultSymbolizer";
                }
                /*$scope.getStyle = function(feature) {
                    for (var i = 0; i < scope.selectionModel.selectedFeatures.length; i++) {
                        if (scope.selectionModel.selectedFeatures[i] == feature) {
                            return scope.highStyle;
                        }
                    }
                    return scope.lowStyle;
                }*/
                $scope.isInsideBoundaries = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('selectionModel', function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch('featureCommands', function(val) { $scope.featureCommands = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
                /*$attr.$observe('style', function(val) { $scope.lowStyle = angular.extend({}, val); $scope.highStyle = angular.extend({}, val); $scope.highStyle.strokeWidth = 7; });*/
            }
        };
        return directiveDefinitionObject;
    });

