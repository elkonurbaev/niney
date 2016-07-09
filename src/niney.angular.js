angular.module("niney", ["monospaced.mousewheel"]).
    factory("windowBoundsModel", ["$rootScope", "$window", function($rootScope, $window) {
        var model = new BoundsModel();
        model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
        $window.addEventListener("resize", function(resizeEvent) {
            $rootScope.$apply(function() {
                model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
            });
        });
        return model;
    }]).
    factory("defaultBoundsModel", function() {
        return new BoundsModel();
    }).
    factory("defaultFocusModel", ["$rootScope", function($rootScope) {
        var model = new FocusModel();
        model.animationTimer.scope = $rootScope;
        model.incubationTimer.scope = $rootScope;
        return model;
    }]).
    factory("defaultEnvelopeModel", function() {
        return new EnvelopeCenterScale();
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
    directive("map", ["$document", "defaultBoundsModel", "defaultFocusModel", "defaultEnvelopeModel", function($document, defaultBoundsModel, defaultFocusModel, defaultEnvelopeModel) {
        return {
            template: '<div ng-transclude msd-wheel="mouseWheelHandler($event, $delta, $deltaX, $deltaY)" class="mapviewer"></div>',
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=?boundsmodel",
                focusModel: "=?focusmodel",
                envelopeModel: "=?envelopemodel",
                mouseWheelAction: "@mousewheelaction"
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
                            val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        };
                        resizeTimer.timerHandler.apply();
                        resizeTimer.start();
                    }
                });
                $scope.$watch("focusModel", function(val) {
                    if (val == null) {
                        $scope.focusModel = defaultFocusModel;
                    }
                });
                $scope.$watch("envelopeModel", function(val) {
                    if (val == null) {
                        $scope.envelopeModel = defaultEnvelopeModel;
                    } else {
                        $scope.$watch("boundsModel.bounds", function(val1) {
                            val.setBounds(val1);
                        });
                        $scope.$watch("focusModel.animationCenterScale", function(val1) {
                            val.setCenterScale(val1);
                        });
                    }
                });
                
                var mouseWheelTime = (new Date()).getTime();
                var mouseWheelDelta = -1;
                
                $scope.mouseWheelHandler = function(mouseEvent, delta, deltaX, deltaY) {
                    mouseEvent.preventDefault();
                    
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    
                    if ($scope.mouseWheelAction == "HORIZONTAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX - cs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX + cs.getNumWorldCoords(width / 2),
                                cs.centerY,
                                cs.scale
                            ));
                        }
                    } else if ($scope.mouseWheelAction == "VERTICAL_PAN") {
                        if (delta > 0) {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY + cs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        } else {
                            $scope.focusModel.setCenterScale(new CenterScale(
                                cs.centerX,
                                cs.centerY - cs.getNumWorldCoords(height / 2),
                                cs.scale
                            ));
                        }
                    } else {  // ZOOM
                        var now = (new Date()).getTime();
                        if ((now - mouseWheelTime > 250) || (mouseWheelDelta * delta < 0)) {
                            var mouseX = mouseEvent.originalEvent.clientX - $element[0].getBoundingClientRect().left;
                            var mouseY = mouseEvent.originalEvent.clientY - $element[0].getBoundingClientRect().top;
                            
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
                            
                            $scope.focusModel.sawoo(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, true);
                        }
                        
                        mouseWheelTime = now;
                        mouseWheelDelta = delta;
                    }
                };
                
                $element.on("mousedown", pressHandler);
                $element.on("touchstart", pressHandler);
                
                var panTimer = new PanSpeedTimer(50, -1); // Role of timer is 2-fold: measure pan speed, but also apply digest cycle every tick.
                panTimer.scope = $scope;
                
                function pressHandler(event) {
                    if (panTimer.isRunning()) {  // From 1 to 2 fingers is not a true press anymore.
                        return;
                    }
                    
                    event.preventDefault();
                    decorateTouchEvent(event, false);
                    
                    var pressX = event.clientX - $element[0].getBoundingClientRect().left;
                    var pressY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    var bounds = $scope.boundsModel.bounds;
                    var width = bounds.width;
                    var height = bounds.height;
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var worldX = cs.getWorldX(width, pressX);
                    var worldY = cs.getWorldY(height, pressY);
                    
                    var pixXOffset = pressX - (width / 2);
                    var pixYOffset = pressY - (height / 2);
                    
                    $scope.focusModel.bazoo(worldX, worldY, pixXOffset, pixYOffset);
                    
                    if (event.type == "mousedown") {
                        $document.on("mousemove", mouseMoveHandler);
                        $document.on("mouseup", releaseHandler);
                    } else {  // touchstart
                        $document.on("touchmove", touchMoveHandler);
                        $document.on("touchend", releaseHandler);
                        $document.on("touchcancel", releaseHandler);
                    }
                    
                    panTimer.panEvent = event;
                    panTimer.start();
                };
                
                function mouseMoveHandler(mouseEvent) {
                    mouseEvent.preventDefault();
                    
                    var cs = $scope.focusModel.animationCenterScale;
                    var dx = cs.getNumWorldCoords(mouseEvent.clientX - panTimer.panEvent.clientX);
                    var dy = cs.getNumWorldCoords(mouseEvent.clientY - panTimer.panEvent.clientY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    panTimer.panEvent = mouseEvent;
                }
                
                function touchMoveHandler(touchEvent) {
                    touchEvent.preventDefault();
                    decorateTouchEvent(touchEvent, false);
                    
                    if (touchEvent.touches.length == panTimer.panEvent.touches.length) {
                        var pinchX = touchEvent.clientX - $element[0].getBoundingClientRect().left;
                        var pinchY = touchEvent.clientY - $element[0].getBoundingClientRect().top;
                        
                        var bounds = $scope.boundsModel.bounds;
                        var width = bounds.width;
                        var height = bounds.height;
                        
                        var cs = $scope.focusModel.animationCenterScale;
                        var worldX = cs.getWorldX(width, pinchX);
                        var worldY = cs.getWorldY(height, pinchY);
                        var scale = cs.scale / (touchEvent.radius / panTimer.panEvent.radius);
                        
                        var pixXOffset = pinchX + (touchEvent.clientX - panTimer.panEvent.clientX) - (width / 2);
                        var pixYOffset = pinchY + (touchEvent.clientY - panTimer.panEvent.clientY) - (height / 2);
                        
                        $scope.focusModel.sawoo(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, false);
                    }
                    
                    panTimer.panEvent = touchEvent;
                }
                
                function releaseHandler(event) {
                    if ((event.touches != null) && (event.touches.length > 0)) {  // From 2 to 1 fingers is not a true release yet.
                        return;
                    }
                    
                    var speed = panTimer.resetAndGetSpeed();
                    if ((speed.h == 0) || (speed.v == 0)) {
                        panTimer.tick();
                    } else {
                        var cs = $scope.focusModel.animationCenterScale;
                        $scope.focusModel.setCenterScale(new CenterScale(
                            cs.centerX - cs.getNumWorldCoords(speed.h) * 1000 / 4,  // * animationDuration / 2 ^ deceleration
                            cs.centerY + cs.getNumWorldCoords(speed.v) * 1000 / 4,
                            cs.scale
                        ), (event.type == "mouseup"));  // On touch devices, don't do the zoom level check.
                    }
                    
                    if (event.type == "mouseup") {
                        $document.off("mousemove", mouseMoveHandler);
                        $document.off("mouseup", releaseHandler);
                    } else {  // touchend || touchcancel
                        $document.off("touchmove", touchMoveHandler);
                        $document.off("touchend", releaseHandler);
                        $document.off("touchcancel", releaseHandler);
                    }
                    
                    panTimer.panEvent = null;
                }
            }
        };
    }]).
    directive("tilelayer", function() {
        return {
            template: '<div class="tileslayer"><img ng-if="layer.visible" ng-src="{{tile.url}}" style="position: absolute" ng-style="tile.toCSS()"/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                envelope: "=envelope",
                centerScale: "=?centerscale"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tile = null;
                
                $parentCtrl.scope.$watch("boundsModel.bounds", function(val) { resetTile(); });
                $parentCtrl.scope.$watch("focusModel.animationCenterScale", function(val) { if ($scope.centerScale == null) resetTile(); });
                
                $scope.$watch("layer", function(val) { $scope.tile = new Tile(1, 1, 1, val.tileWidth, undefined, val.baseURL); resetTile(); });
                $scope.$watch("envelope", function(val) { resetTile(); });
                $scope.$watch("centerScale", function(val) { resetTile(); });
                
                function resetTile() {
                    if ($scope.tile == null) {
                        return;
                    }
                    if ($parentCtrl.scope.boundsModel.bounds == null) {
                        return;
                    }
                    if ($scope.envelope == null) {
                        return;
                    }
                    if (($scope.centerScale == null) && ($parentCtrl.scope.focusModel.animationCenterScale == null)) {
                        return;
                    }
                    
                    $scope.tile.resetWithEnvelope($parentCtrl.scope.boundsModel.bounds, $scope.centerScale || $parentCtrl.scope.focusModel.animationCenterScale, $scope.envelope);
                }
            }
        };
    }).
    directive("tileslayer", ["defaultTilesLayer", function(defaultTilesLayer) {
        return {
            template: '<div class="tileslayer"><div ng-if="tileModel.layer.visible" class="tileslayer"><img ng-repeat="tile in tileModel.tiles | filter: {completed: true}" ng-src="{{tile.url}}" style="position: absolute" ng-style="tile.toCSS()"/><div class="tileslayer"></div></div></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.tileModel.layer = (val || defaultTilesLayer); });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
            }
        };
    }]).
    directive("utfgridlayer", ["$http", function($http) {
        return {
            template: '<div ng-mousemove="mouseMoveHandler($event)" class="tileslayer"></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                featureCommands: "=featurecommands"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.utfGridModel = new UTFGridModel();
                $scope.utfGridModel.http = $http;
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.utfGridModel.layer = val; });
                $scope.$watch("boundsModel.bounds", function(val) { $scope.utfGridModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.utfGridModel.setCenterScale(val); });
                
                $scope.mouseMoveHandler = function(mouseEvent) {
                    var mouseX = mouseEvent.clientX - $element[0].getBoundingClientRect().left;
                    var mouseY = mouseEvent.clientY - $element[0].getBoundingClientRect().top;
                    
                    $scope.featureCommands[0].perform($scope.utfGridModel.getFeature(mouseX, mouseY));
                };
                
                $element.on("mousedown", pressHandler);
                $element.on("touchstart", pressHandler);
                
                function pressHandler(event) {
                    decorateTouchEvent(event, true);
                    
                    var pressX = event.clientX - $element[0].getBoundingClientRect().left;
                    var pressY = event.clientY - $element[0].getBoundingClientRect().top;
                    
                    $scope.featureCommands[2].perform($scope.utfGridModel.getFeature(pressX, pressY));
                };
            }
        };
    }]).
    directive("wmslayer", function() {
        return {
            template: '<div class="wmslayer"><img maploader ng-if="layer.visible" ng-show="wmsModel.tile.completed" ng-src="{{wmsModel.tile.url}}" style="position: absolute" ng-style="wmsModel.tile.toCSS()"/></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.wmsModel = new WMSModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("layer", function(val) { $scope.wmsModel.layer = val; $scope.wmsModel.load(); });
                $scope.$watchCollection("layer.filterModels", function(val) { $scope.wmsModel.load(); });
                $scope.$watch("layer.vendorSpecifics", function(val) { $scope.wmsModel.load(); }, true);
                $scope.$watch("boundsModel.bounds", function(val) { $scope.wmsModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.wmsModel.setAnimationCenterScale(val); });
                $scope.$watch("focusModel.incubationCenterScale", function(val) { $scope.wmsModel.setCenterScale(val); });
            }
        };
    }).
    directive("maploader", function() {
        return {
            restrict: "A",
            link: function($scope, $element, $attr) {
                $element.on("load", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
                $element.on("error", function() { $scope.$apply(function() { $scope.wmsModel.tile.completed = true; }); });
            }
        };
    }).
    directive("mapfeaturelayer", function() {
        return {
            template: '<div class="mapfeaturelayer"></div>',
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
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            compile: function(element, attr, transclude) {
                return function($scope, $element, $attr, $parentCtrl) {
                    $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                    $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                    $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                    
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
                            transclude(childScope, function(clone) {
                                childElement = clone;
                                $element.append(clone);
                            });
                        }
                    });
                }
            }
        };
    }).
    directive("geometrysymbolizer", function() {
        return {
            template: '<div class="mapfeaturelayer"><div ng-if="maxScale >= focusModel.animationCenterScale.scale" class="mapfeaturelayer"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" ng-repeat="feature in featureModel.features" class="mapfeature"><polyline ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:intersectsEnvelope" points="{{toSVGPoints(boundsModel.bounds, focusModel.animationCenterScale, geometry.points)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapgeometry\' + \' \' + highClass: \'mapgeometry\'"/></svg></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.envelope);
                };
                $scope.toSVGPoints = (new SVGConverter()).pointsToSVGPoints;
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                }
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                }
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                }
                $scope.isSelected = function(feature) {
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        };
    }).
    directive("imagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in featureModel.features | filter:intersectsEnvelope" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(feature.propertyValues[propertyIndex])"/></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                assetPropertyIndex: "@assetpropertyindex",
                asset: "@asset",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.envelope);
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
                $scope.isSelected = function(feature) {
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
                $scope.getCSS = function(geometry) {
                    var css = {};
                    css.left = $scope.focusModel.animationCenterScale.getPixX($scope.boundsModel.bounds.width, geometry.x) + "px";
                    css.top = $scope.focusModel.animationCenterScale.getPixY($scope.boundsModel.bounds.height, geometry.y) + "px";
                    return css;
                }
            }
        };
    }).
    directive("geometryimagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale" ng-repeat="feature in featureModel.features"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:intersectsEnvelope track by $index" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(geometry)"/></div></div>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                MAX_SCALE: "@maxscale",
                propertyIndex: "@propertyindex",
                assetPropertyIndex: "@assetpropertyindex",
                asset: "@asset",
                highClass: "@highclass"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.envelope);
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
                $scope.isSelected = function(feature) {
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
                $scope.getCSS = function(geometry) {
                    var css = {};
                    css.left = $scope.focusModel.animationCenterScale.getPixX($scope.boundsModel.bounds.width, geometry.x) + "px";
                    css.top = $scope.focusModel.animationCenterScale.getPixY($scope.boundsModel.bounds.height, geometry.y) + "px";
                    return css;
                }
            }
        };
    });

