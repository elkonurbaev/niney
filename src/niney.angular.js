angular.module("niney", ["monospaced.mousewheel"]).
    factory("defaultBoundsModel", function() {
        return new BoundsModel();
    }).
    factory("defaultTilesLayer", function() {
        return new Layer("Tiles");
    }).
    directive("legend", function() {
        return {
            template: '<div><ul><li ng-repeat="layer in layers"><label class="visible-{{layer.visible}}"><input type="checkbox" ng-model="layer.visible"/>{{layer.title}}</label></li></ul></div>',
            restrict: "EA",
            replace: true,
            scope: {
                layers: "=layers"
            }
        };
    }).
    directive("map", ["$document", "defaultBoundsModel", function factory($document, defaultBoundsModel) {
        return {
            template: '<div class="mapviewer" ng-mousedown="mouseDownHandler($event)" msd-wheel="mouseWheelHandler($event, $delta)" ng-transclude/>',
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=?boundsmodel",
                focusModel: "=focusmodel",
                envelopeModel: "=envelopemodel"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            link: function($scope, $element, $attr) {
                $scope.$watch("boundsModel", function(val) {
                    if (val == null) {
                        $scope.boundsModel = defaultBoundsModel;
                    } else {
                        var resizeTimer = new Timer(2000, -1);
                        resizeTimer.scope = $scope;
                        resizeTimer.timerHandler = function() {
                            var width = $element[0].offsetWidth;
                            var height = $element[0].offsetHeight;
                            $scope.boundsModel.setBounds(new Bounds(width, height));
                        };
                        resizeTimer.timerHandler.apply();
                        resizeTimer.start();
                    }
                });
                
                var mouseX = -1;
                var mouseY = -1;
                var mouseDownX = -1;
                var mouseDownY = -1;
                var mouseMoveTimer = new Timer(50, -1);
                mouseMoveTimer.scope = $scope;
                mouseMoveTimer.timerHandler = function() {
                    var foo = "bar";
                };
                
                $document.on("mousemove", mouseMoveHandler);
                
                function mouseMoveHandler(mouseEvent) {
                    mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                }
                
                $scope.mouseDownHandler = function(mouseEvent) {
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, mouseX);
                    var worldY = cs.getWorldY(height, mouseY);
                    
                    var pixXOffset = mouseX - (width / 2);
                    var pixYOffset = mouseY - (height / 2);
                    
                    $scope.focusModel.bazoo(worldX, worldY, pixXOffset, pixYOffset);
                    
                    mouseDownX = mouseX;
                    mouseDownY = mouseY;
                    
                    mouseMoveTimer.start();
                    $document.on("mousemove", mouseMoveHandler1);
                    $document.on("mouseup", mouseUpHandler);
                    
                    mouseEvent.preventDefault();
                };
                
                function mouseMoveHandler1(mouseEvent) {
                    var cs = $scope.focusModel.animationCenterScale;
                    var dx = cs.getNumWorldCoords(mouseX - mouseDownX);
                    var dy = cs.getNumWorldCoords(mouseY - mouseDownY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    mouseDownX = mouseX;
                    mouseDownY = mouseY;
                }
                
                function mouseUpHandler(mouseEvent) {
                    mouseMoveTimer.stop();
                    $document.off("mousemove", mouseMoveHandler1);
                    $document.off("mouseup", mouseUpHandler);

                    mouseDownX = -1;
                    mouseDownY = -1;
                }
                
                $scope.mouseWheelHandler = function(mouseEvent, delta) {
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, mouseX);
                    var worldY = cs.getWorldY(height, mouseY);
                    var scale = cs.scale;
                    
                    if (delta > 0) {
                        scale /= 2;
                    } else {
                        scale *= 2;
                    }
                    var pixXOffset = mouseX - (width / 2);
                    var pixYOffset = mouseY - (height / 2);
                    
                    $scope.focusModel.setCenterScale(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
                    
                    mouseEvent.preventDefault();
                };
            }
        };
    }]).
    directive("tileslayer", ["defaultTilesLayer", function factory(defaultTilesLayer) {
        return {
            template: '<div class="tileslayer"><img ng-repeat="tile in tileModel.tiles" ng-src="{{tile.url}}" style="position: absolute; opacity: 0.9;" ng-style="tile.toCSS()"/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer"
            },
            link: function ($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.tileModel.layer = (val || defaultTilesLayer); });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
            }
        };
    }]).
    directive("utfgridlayer", ["$http", function factory($http) {
        return {
            template: '<div class="tileslayer" ng-mousemove="mouseMoveHandler($event)" ng-click="clickHandler($event)"></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                featureCommands: "=featurecommands"
            },
            link: function ($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                $scope.tileModel.urlExtension = "$Z/$X/$Y.json";
                $scope.utfGridModel = new UTFGridModel();
                $scope.utfGridModel.http = $http;
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.tileModel.layer = val; });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
                
                $scope.$watchCollection("tileModel.tiles", function(val) { $scope.utfGridModel.setTiles($scope.tileModel.numColumns, val.concat()); });
                
                $scope.mouseMoveHandler = function(mouseEvent) {
                    var mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    var mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                    $scope.featureCommands[0].perform($scope.utfGridModel.getFeature(mouseX, mouseY));
                }
                $scope.clickHandler = function(mouseEvent) {
                    var mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    var mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                    $scope.featureCommands[2].perform($scope.utfGridModel.getFeature(mouseX, mouseY));
                }
            }
        };
    }]).
    directive("wmslayer", function factory() {
        return {
            template: '<div class="wmslayer"><img ng-src="{{wmsModel.tile.url}}" style="position: absolute; opacity: 0.8;" ng-style="wmsModel.tile.toCSS()" ng-if="layer.visible" ng-show="wmsModel.tile.completed" maploader/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer"
            },
            link: function ($scope, $element, $attr, $parentCtrl) {
                $scope.wmsModel = new WMSModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.wmsModel.layer = val; $scope.wmsModel.load(); });
                $scope.$watch("layer.filterModels", function(val) { $scope.wmsModel.load(); });
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
                $element.on("load", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
                $element.on("error", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
            }
        };
    }).
    directive("mapfeaturelayer", function factory() {
        return {
            template: '<div class="mapfeaturelayer"/>',
            restrict: "EA",
            require: "^map",
            replace: true,
            transclude: true,
            scope: {
                layer: "=layer",
                featureModel: "=featuremodel",
                selectionModel: "=selectionmodel",
                featureCommands: "=featurecommands"
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
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in featureModel.features | filter:isInsideBoundaries" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="getStyle(feature)" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute" ng-style="getCSS(feature)"/></div>',
            restrict: 'EA',
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
                $scope.getCSS = function(feature) {
                    var css = {};
                    css.left = $scope.focusModel.animationCenterScale.getPixX($scope.boundsModel.bounds.width, feature.propertyValues[$scope.propertyIndex].x) + "px";
                    css.top = $scope.focusModel.animationCenterScale.getPixY($scope.boundsModel.bounds.height, feature.propertyValues[$scope.propertyIndex].y) + "px";
                    return css;
                }
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
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.animationCenterScale.scale"><div ng-repeat="feature in featureModel.features"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries track by $index" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="getStyle(feature)" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.animationCenterScale.getPixY(boundsModel.bounds.height, geometry.y)}}px; left: {{focusModel.animationCenterScale.getPixX(boundsModel.bounds.width, geometry.x)}}px" /></div></div>',
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

