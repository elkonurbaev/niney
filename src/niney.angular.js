angular.module("niney", ["monospaced.mousewheel"]).
    factory("heartbeatTimer", ["$rootScope", function($rootScope) {
        var timer = new Timer(2000, -1);
        timer.scope = $rootScope;
        timer.timerHandler = function() {
            for (var i = 0; i < timer.subTimerHandlers.length; i++) {
                timer.subTimerHandlers[i].apply();
            }
        };
        timer.subTimerHandlers = [];
        timer.addSubTimerHandler = function(subTimerHandler) {
            timer.subTimerHandlers.push(subTimerHandler);
        };
        timer.removeSubTimerHandler = function(subTimerHandler) {
            for (var i = 0; i < timer.subTimerHandlers.length; i++) {
                if (timer.subTimerHandlers[i] == subTimerHandler) {
                    timer.subTimerHandlers.splice(i, 1);
                    return;
                }
            }
        };
        timer.start();
        return timer;
    }]).
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
    directive("map", ["$document", "heartbeatTimer", "defaultBoundsModel", "defaultFocusModel", "defaultEnvelopeModel", function($document, heartbeatTimer, defaultBoundsModel, defaultFocusModel, defaultEnvelopeModel) {
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
                        val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        heartbeatTimer.addSubTimerHandler(function() {
                            val.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                        });
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
                    
                    var cs = $scope.focusModel.centerScale;
                    
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
                        if (!$scope.focusModel.scaleToZoomLevels || (now - mouseWheelTime > 250) || (mouseWheelDelta * delta < 0)) {
                            mouseWheelTime = now;
                            mouseWheelDelta = delta;
                            
                            var mouseX = mouseEvent.originalEvent.clientX - $element[0].getBoundingClientRect().left;
                            var mouseY = mouseEvent.originalEvent.clientY - $element[0].getBoundingClientRect().top;
                            
                            var worldX = cs.getWorldX(width, mouseX);
                            var worldY = cs.getWorldY(height, mouseY);
                            var scale = cs.scale;
                            
                            if (!$scope.focusModel.scaleToZoomLevels) {
                                if (delta > 0) {
                                    scale /= 1.3;
                                } else {
                                    scale *= 1.3;
                                }
                            } else {
                                if (delta > 0) {
                                    scale /= 2;
                                } else {
                                    scale *= 2;
                                }
                            }
                            var pixXOffset = mouseX - (width / 2);
                            var pixYOffset = mouseY - (height / 2);
                            
                            $scope.focusModel.sawoo(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset, true);
                        }
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
                
                $scope.$watch("layer", function(val) { $scope.tile = new Tile(-1, -1, 1, 1, 1, val.tileWidth, undefined, val.baseURL); resetTile(); });
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
            template: '<canvas ng-show="tileModel.layer.visible" width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="tileslayer"></canvas>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                $scope.tileModel.ctx = $element[0].getContext("2d");
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setCenterScale(val); });
                $scope.$watch("layer", function(val) { $scope.tileModel.setLayer(val || defaultTilesLayer); });
                $scope.$watch("tileModel.layer.visible", function(val) { $scope.tileModel.resetLoaders(); });
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
                
                $scope.$watch("layer", function(val) { $scope.wmsModel.layer = val; $scope.wmsModel.load(); }, true);
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
    directive("canvassymbolizer", function() {
        return {
            template: '<canvas width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="mapfeaturelayer"></canvas>',
            restrict: "EA",
            require: "^mapfeaturelayer",
            replace: true,
            scope: {
                maxScale: "=?maxscale",
                propertyIndex: "=propertyindex",
                deepWatch: "=?deepwatch",
                envelopeCheck: "=?envelopecheck",
                inverseFill: "=?inversefill"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                
                $scope.$watch("maxScale", function(val) { if (!angular.isDefined(val)) { $scope.maxScale = Number.MAX_VALUE; }});
                $scope.$watch("deepWatch", function(val) { if (!angular.isDefined(val) || val) {
                    $scope.$watch("featureModel.features", watchHandler, true);
                } else {
                    $scope.$watchCollection("featureModel.features", watchHandler);
                }});
                $scope.$watch("envelopeCheck", function(val) { if (!angular.isDefined(val)) { $scope.envelopeCheck = true; }});
                $scope.$watch("inverseFill", function(val) { if (!angular.isDefined(val)) { $scope.inverseFill = false; }});
                $scope.$watch("envelopeModel.envelope", watchHandler);
                
                // Not every envelope change is caused by a resize, so don't change width/height in the watch handler.
                function watchHandler(val) {
                    if ($scope.boundsModel == null) {
                        return;
                    }
                    
                    var ctx = $element[0].getContext("2d");
                    var width = $scope.boundsModel.bounds.width;
                    var height = $scope.boundsModel.bounds.height;
                    ctx.setTransform(1, 0, 0, 1, 0, 0);  // ctx.resetTransform();
                    ctx.clearRect(0, 0, width, height);
                    
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    var centerScale = $scope.focusModel.animationCenterScale;
                    var scaling = centerScale.getNumPixs(1);
                    var dx = -centerScale.centerX * scaling + width / 2;
                    var dy = centerScale.centerY * scaling + height / 2;
                    ctx.setTransform(scaling, 0, 0, -scaling, dx, dy);
                    
                    var css = getComputedStyle($element[0]);
                    ctx.fillStyle = css.getPropertyValue("fill");
                    ctx.strokeStyle = css.getPropertyValue("stroke");
                    ctx.lineWidth = parseInt(css.getPropertyValue("stroke-width")) / scaling;
                    
                    for (var i = 0; i < $scope.featureModel.features.length; i++) {
                        var geometry = $scope.featureModel.features[i].propertyValues[$scope.propertyIndex];
                        if (geometry instanceof Geometry) {
                            if (!$scope.envelopeCheck || (geometry.intersects($scope.envelopeModel.envelope))) {
                                var geometries = getGeometries(geometry);
                                for (var j = 0; j < geometries.length; j++) {
                                    var geometry = geometries[j];
                                    if (!$scope.envelopeCheck || (geometry.intersects($scope.envelopeModel.envelope))) {
                                        var path = (new SVGConverter()).geometryToPath($scope.boundsModel.bounds, centerScale, geometry);
                                        draw(ctx, path);
                                    }
                                }
                            }
                        } else {  // geometry is a path string.
                            draw(ctx, geometry);
                        }
                    }
                }
                
                function getGeometries(geometry) {
                    var geometries = null;
                    if (geometry instanceof Point) {
                        geometries = [new LineString(geometry, geometry)];
                    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
                        geometries = [geometry];
                    } else {  // geometry is a multi-geometry or geometry collection.
                        geometries = geometry.childGeometries;
                    }
                    return geometries;
                }
                
                function draw(ctx, path) {
                    if ($scope.inverseFill) {
                        var envelope = $scope.envelopeModel.envelope;
                        var minx = envelope.getMinX();
                        var miny = envelope.getMinY();
                        var maxx = envelope.getMaxX();
                        var maxy = envelope.getMaxY();
                        var path = "M " + minx + " " + miny + " " + " L " + maxx + " " + miny + " " + maxx + " " + maxy + " " + minx + " " + maxy + " Z " + path;
                    }
                    if (typeof Path2D === "function") {
                        var p = new Path2D(path);
                        ctx.fill(p, "evenodd");
                        ctx.filter = getComputedStyle($element[0]).getPropertyValue("--stroke-filter");
                        ctx.stroke(p);
                        ctx.filter = "none";
                    } else {  // Polyfill for IE11.
                        ctx.beginPath();
                        path = path.replace(/,/g, " ");
                        var pathItems = path.split(" ");
                        for (var i = 0; i < pathItems.length; i++) {
                            if ((pathItems[i] == "") || (pathItems[i] == "Z") || (pathItems[i] == "L")) {
                                continue;
                            }
                            if (pathItems[i] == "M") {
                                ctx.moveTo(pathItems[++i], pathItems[++i]);
                            } else {
                                ctx.lineTo(pathItems[i], pathItems[++i]);
                            }
                        }
                        ctx.fill("evenodd");
                        ctx.filter = getComputedStyle($element[0]).getPropertyValue("--stroke-filter");
                        ctx.stroke();
                        ctx.filter = "none";
                    }
                }
            }
        };
    }).
    directive("geometrysymbolizer", ["$filter", function($filter) {
        return {
            template: '<div class="mapfeaturelayer"><div ng-if="maxScale >= focusModel.animationCenterScale.scale" class="mapfeaturelayer"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" ng-repeat="feature in filteredFeatures" class="mapfeature"><path ng-repeat="geometry in getFilteredGeometries(feature)" d="{{toSVGPoints(boundsModel.bounds, focusModel.animationCenterScale, geometry)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapgeometry\' + \' \' + highClass: \'mapgeometry\'"/></svg></div></div>',
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
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.filteredFeatures = [];
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                $scope.$watch("envelopeModel.envelope", watchHandler);
                $scope.$watch("featureModel.features", watchHandler, true);
                
                function watchHandler(val) {
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if (($scope.envelopeModel == null) || ($scope.envelopeModel.envelope == null)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    $scope.filteredFeatures = $filter("filter")($scope.featureModel.features, function(item) {
                        var featureEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                        return featureEnvelope.intersects($scope.envelopeModel.envelope);
                    });
                };
                
                $scope.getFilteredGeometries = function(feature) {
                    var geometry = feature.propertyValues[$scope.propertyIndex];
                    var geometries = null;
                    if (geometry instanceof Point) {
                        geometries = [new LineString(geometry, geometry)];
                    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
                        geometries = [geometry];
                    } else {  // Multi-geometry or geometry collection.
                        geometries = geometry.childGeometries;
                    }
                    return $filter("filter")(geometries, function(item) {
                        var geometryEnvelope = item.getEnvelope();
                        return geometryEnvelope.intersects($scope.envelopeModel.envelope);
                    });
                };
                $scope.toSVGPoints = (new SVGConverter()).geometryToPath;
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
                    if ($scope.selectionModel == null) {
                        return false;
                    }
                    for (var i = 0; i < $scope.selectionModel.selectedFeatures.length; i++) {
                        if ($scope.selectionModel.selectedFeatures[i] == feature) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        };
    }]).
    directive("imagesymbolizer", ["$filter", function($filter) {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in filteredFeatures" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(feature.propertyValues[propertyIndex])"/></div></div>',
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
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch("selectionModel", function(val) { $scope.selectionModel = val; });
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val; });
                
                $scope.filteredFeatures = [];
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                $scope.$watch("envelopeModel.envelope", watchHandler);
                $scope.$watch("featureModel.features", watchHandler, true);
                
                function watchHandler(val) {
                    if (($scope.focusModel == null) || ($scope.focusModel.animationCenterScale.scale > $scope.maxScale)) {
                        return;
                    }
                    if (($scope.envelopeModel == null) || ($scope.envelopeModel.envelope == null)) {
                        return;
                    }
                    if ($scope.featureModel == null) {
                        return;
                    }
                    
                    $scope.filteredFeatures = $filter("filter")($scope.featureModel.features, function(item) {
                        var featureEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                        return featureEnvelope.intersects($scope.envelopeModel.envelope);
                    });
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
                    if ($scope.selectionModel == null) {
                        return false;
                    }
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
    }]).
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
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
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

