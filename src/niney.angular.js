if (typeof angular !== "undefined") {
    angular.module("niney", []).
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
        model.incubationTimer.scope = $rootScope;
        model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
        $window.addEventListener("resize", function(resizeEvent) {
            $rootScope.$apply(function() {
                model.setBounds(new Bounds($window.innerWidth, $window.innerHeight));
            });
        });
        return model;
    }]).
    factory("defaultBoundsModel", ["$rootScope", function($rootScope) {
        var model = new BoundsModel();
        model.incubationTimer.scope = $rootScope;
        return model;
    }]).
    factory("defaultFocusModel", ["$rootScope", function($rootScope) {
        var model = new FocusModel();
        model.animationTimer.scope = $rootScope;
        model.incubationTimer.scope = $rootScope;
        return model;
    }]).
    factory("defaultEnvelopeModel", ["defaultBoundsModel", "defaultFocusModel", function(defaultBoundsModel, defaultFocusModel) {
        return new EnvelopeModel(defaultBoundsModel, defaultFocusModel);
    }]).
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
            template: '<div ng-transclude class="mapviewer"></div>',
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                boundsModel: "=?boundsmodel",
                focusModel: "=?focusmodel",
                envelopeModel: "=?envelopemodel",
                mouseWheelAction: "@mousewheelaction",
                tapFunction: "=nTap",
                pressFunction: "=nPress",
                releaseFunction: "=nRelease",
                mouseMoveFunction: "=nMousemove"
            },
            controller: ["$scope", function($scope) {
                this.scope = $scope;
            }],
            link: function($scope, $element, $attr) {
                var env = {
                    boundsModel: $scope.boundsModel,
                    focusModel: $scope.focusModel,
                    mouseWheelAction: $scope.mouseWheelAction,
                    tapFunction: $scope.tapFunction,
                    pressFunction: $scope.pressFunction,
                    releaseFunction: $scope.releaseFunction,
                    mouseMoveFunction: $scope.mouseMoveFunction
                };
                $scope.mapController = new MapController($element[0], env, $scope);
                
                $scope.$watch("boundsModel", function(val) {
                    if (val == null) {
                        $scope.boundsModel = defaultBoundsModel;
                    }
                    $scope.boundsModel.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                    heartbeatTimer.addSubTimerHandler(function() {
                        $scope.boundsModel.setBounds(new Bounds($element[0].offsetWidth, $element[0].offsetHeight));
                    });
                    env.boundsModel = $scope.boundsModel;
                });
                $scope.$watch("focusModel", function(val) {
                    if (val == null) {
                        $scope.focusModel = defaultFocusModel;
                    }
                    env.focusModel = $scope.focusModel;
                });
                $scope.$watch("envelopeModel", function(val) {
                    if (val == null) {
                        $scope.envelopeModel = defaultEnvelopeModel;
                    }
                });
                $scope.$watch("mouseWheelAction", function(val) { env.mouseWheelAction = val; });
                $scope.$watch("tapFunction", function(val) { env.tapFunction = val; });
                $scope.$watch("pressFunction", function(val) { env.pressFunction = val; });
                $scope.$watch("releaseFunction", function(val) { env.releaseFunction = val; });
                $scope.$watch("mouseMoveFunction", function(val) { env.mouseMoveFunction = val; });
                
                $scope.$on("$destroy", function() { $scope.mapController.destroy(); });
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
            template: '<canvas width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="tileslayer"></canvas>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=?layer",
                loader: "=?loader",
                protocol: "@protocol",
                tileWidth: "@tilewidth",
                tileHeight: "@tileheight"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.tileModel = new TileModel();
                $scope.tileModel.ctx = $element[0].getContext("2d");
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; $scope.tileModel.srs = (val? val.srs: null); });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.tileModel.setBounds(val, $scope.envelopeModel? $scope.envelopeModel.getEnvelope(): null, $scope.envelopeModel? $scope.envelopeModel.getAnimationEnvelope(): null); });
                $scope.$watch("focusModel.centerScale", function(val) { $scope.tileModel.setCenterScale(val, $scope.envelopeModel? $scope.envelopeModel.getEnvelope(): null); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.tileModel.setAnimationCenterScale(val, $scope.envelopeModel? $scope.envelopeModel.getAnimationEnvelope(): null); });
                $scope.$watch("layer", function(val) { if (angular.isDefined(val)) { $scope.tileModel.setLayer(val); } else { $scope.tileModel.setLayer(defaultTilesLayer); }});
                $scope.$watch("layer.visible", function(val) { $scope.tileModel.resetTiles(); });
                $scope.$watch("loader", function(val) { $scope.tileModel.loader = val; });
                $scope.$watch("protocol", function(val) { if (angular.isDefined(val)) { $scope.tileModel.protocol = val; }});
                $scope.$watch("tileWidth", function(val) { if (angular.isDefined(val)) { $scope.tileModel.tileWidth = parseInt(val); }});
                $scope.$watch("tileHeight", function(val) { if (angular.isDefined(val)) { $scope.tileModel.tileHeight = parseInt(val); }});
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
                loader: "=?loader",
                featureCommands: "=featurecommands"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.utfGridModel = new UTFGridModel();
                $scope.utfGridModel.http = $http;
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; $scope.utfGridModel.srs = (val? val.srs: null); });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.utfGridModel.setBounds(val, $scope.envelopeModel? $scope.envelopeModel.getEnvelope(): null, $scope.envelopeModel? $scope.envelopeModel.getAnimationEnvelope(): null); });
                $scope.$watch("focusModel.centerScale", function(val) { $scope.utfGridModel.setCenterScale(val, $scope.envelopeModel? $scope.envelopeModel.getEnvelope(): null); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.utfGridModel.setAnimationCenterScale(val, $scope.envelopeModel? $scope.envelopeModel.getAnimationEnvelope(): null); });
                $scope.$watch("layer", function(val) { $scope.utfGridModel.setLayer(val); });
                $scope.$watch("loader", function(val) { $scope.utfGridModel.loader = val; });
                
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
            template: '<canvas width="{{boundsModel.bounds.width}}" height="{{boundsModel.bounds.height}}" class="wmslayer"></canvas>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                layer: "=layer",
                loader: "=?loader"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.wmsModel = new WMSModel();
                $scope.wmsModel.ctx = $element[0].getContext("2d");
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; $scope.wmsModel.srs = (val? val.srs: null); });
                
                $scope.$watch("boundsModel.bounds", function(val) { $scope.wmsModel.setBounds(val); });
                $scope.$watch("boundsModel.incubationBounds", function(val) { $scope.wmsModel.setIncubationBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { $scope.wmsModel.setAnimationCenterScale(val); });
                $scope.$watch("focusModel.incubationCenterScale", function(val) { $scope.wmsModel.setCenterScale(val); });
                $scope.$watch("layer", function(val) { $scope.wmsModel.setLayer(val); });
                $scope.$watch("layer.visible", function(val) { $scope.wmsModel.load(); });
                $scope.$watch("loader", function(val) { $scope.wmsModel.loader = val; });
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
                featureCommands: "=?featurecommands"
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
                envelopeCheck: "=?envelopecheck",
                propertyIndex: "=?propertyindex",
                deepWatch: "=?deepwatch",
                inverseFill: "=?inversefill"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.mapFeatureModel = new MapFeatureModel();
                $scope.mapFeatureModel.ctx = $element[0].getContext("2d");
                $scope.mapFeatureModel.css = getComputedStyle($element[0]);
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch("featureModel", function(val) { $scope.featureModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { if ($scope.envelopeModel && ($scope.envelopeCheck || $scope.inverseFill)) { $scope.mapFeatureModel.envelope = $scope.envelopeModel.getAnimationEnvelope(); } $scope.mapFeatureModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { if ($scope.envelopeModel && ($scope.envelopeCheck || $scope.inverseFill)) { $scope.mapFeatureModel.envelope = $scope.envelopeModel.getAnimationEnvelope(); } $scope.mapFeatureModel.setCenterScale(val); });
                
                $scope.$watch("maxScale", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.maxScale = val; }});
                $scope.$watch("envelopeCheck", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.envelopeCheck = val; }});
                $scope.$watch("propertyIndex", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.propertyIndex = val; }});
                $scope.$watch("deepWatch", function(val) { if (!angular.isDefined(val) || val) {
                    $scope.$watch("featureModel.features", function(val) { $scope.mapFeatureModel.setFeatures(val); }, true);
                } else {
                    $scope.$watchCollection("featureModel.features", function(val) { $scope.mapFeatureModel.setFeatures(val); });
                }});
                $scope.$watch("inverseFill", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.inverseFill = val; }});
            }
        };
    }).
    directive("geometrylayer", function() {
        return {
            template: '<div class="mapfeaturelayer"><svg ng-if="mapFeatureModel.maxScale >= mapFeatureModel.centerScale.scale" xmlns="http://www.w3.org/2000/svg" version="1.1" class="mapfeature"><path ng-repeat="geometry in mapFeatureModel.nonPointGeometries" ng-attr-d="{{toSVGPath(mapFeatureModel.bounds, mapFeatureModel.centerScale, geometry)}}"/><circle ng-repeat="point in mapFeatureModel.points" ng-attr-cx="{{mapFeatureModel.centerScale.getPixX(mapFeatureModel.bounds.width, point.x)}}" ng-attr-cy="{{mapFeatureModel.centerScale.getPixY(mapFeatureModel.bounds.height, point.y)}}" ng-attr-r="{{circleRadius}}"/></svg></div>',
            restrict: "EA",
            require: "^map",
            replace: true,
            scope: {
                maxScale: "=?maxscale",
                envelopeCheck: "=?envelopecheck",
                deepWatch: "=?deepwatch",
                geometries: "=?geometries",
                geometry: "=?geometry"
            },
            link: function($scope, $element, $attr, $parentCtrl) {
                $scope.mapFeatureModel = new MapFeatureModel();
                
                $parentCtrl.scope.$watch("boundsModel", function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch("focusModel", function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch("envelopeModel", function(val) { $scope.envelopeModel = val; });
                
                $scope.$watch("boundsModel.bounds", function(val) { if ($scope.envelopeModel && $scope.envelopeCheck) { $scope.mapFeatureModel.envelope = $scope.envelopeModel.getAnimationEnvelope(); } $scope.mapFeatureModel.setBounds(val); });
                $scope.$watch("focusModel.animationCenterScale", function(val) { if ($scope.envelopeModel && $scope.envelopeCheck) { $scope.mapFeatureModel.envelope = $scope.envelopeModel.getAnimationEnvelope(); } $scope.mapFeatureModel.setCenterScale(val); });
                
                $scope.$watch("maxScale", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.maxScale = val; }});
                $scope.$watch("envelopeCheck", function(val) { if (angular.isDefined(val)) { $scope.mapFeatureModel.envelopeCheck = val; }});
                $scope.$watch("deepWatch", function(val) { if (!angular.isDefined(val) || val) {
                    $scope.$watch("geometries", function(val) { $scope.mapFeatureModel.setGeometries(val); }, true);
                    $scope.$watch("geometry", function(val) { $scope.mapFeatureModel.setGeometry(val); }, true);
                } else {
                    $scope.$watch("geometries", function(val) { $scope.mapFeatureModel.setGeometries(val); });
                    $scope.$watch("geometry", function(val) { $scope.mapFeatureModel.setGeometry(val); });
                }});
                
                $scope.toSVGPath = (new SVGConverter()).geometryToPixPath;
                
                $scope.circleRadius = 8;
                var circleRadius = getComputedStyle($element[0]).getPropertyValue("--circle-radius");
                if (circleRadius != "") {
                    $scope.circleRadius = parseFloat(circleRadius);
                }
            }
        };
    }).
    directive("geometrysymbolizer", function() {
        return {
            template: '<div class="mapfeaturelayer"><div ng-if="maxScale >= focusModel.animationCenterScale.scale" class="mapfeaturelayer"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" ng-repeat="feature in featureModel.features" class="mapfeature"><path ng-repeat="geometry in getFeatureGeometries(feature) | filter:intersectsEnvelope" d="{{toSVGPoints(boundsModel.bounds, focusModel.animationCenterScale, geometry)}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapgeometry\' + \' \' + highClass: \'mapgeometry\'"/></svg></div></div>',
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
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.getFeatureGeometries = function(feature) {
                    var geometry = feature.propertyValues[$scope.propertyIndex];
                    if (geometry == null) {
                        return null;
                    } else if (geometry instanceof Point) {
                        return [new LineString(geometry, geometry)];
                    } else if ((geometry instanceof LineString) || (geometry instanceof Polygon) || (geometry instanceof Envelope)) {
                        return [geometry];
                    }
                    return geometry.childGeometries;  // Multi-geometry or geometry collection.
                };
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.getAnimationEnvelope());
                };
                $scope.toSVGPoints = (new SVGConverter()).geometryToPixPath;
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                };
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                };
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                };
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
                };
            }
        };
    }).
    directive("imagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale"><img ng-repeat="feature in featureModel.features | filter:intersectsEnvelope" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(boundsModel.bounds, focusModel.animationCenterScale, feature.propertyValues[propertyIndex])"/></div></div>',
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
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.getAnimationEnvelope());
                };
                
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                };
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                };
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                };
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
                };
                
                $scope.getCSS = (new CSSConverter()).pointToPixCSS;
            }
        };
    }).
    directive("geometryimagesymbolizer", function() {
        return {
            template: '<div><div ng-if="maxScale >= focusModel.animationCenterScale.scale" ng-repeat="feature in featureModel.features | filter:intersectsEnvelope"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].childGeometries" ng-src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" ng-mouseover="mouseOverHandler(feature, $event)" ng-mouseout="mouseOutHandler(feature, $event)" ng-click="clickHandler(feature, $event)" ng-class="isSelected(feature)? \'mapimage\' + \' \' + highClass: \'mapimage\'" ng-style="getCSS(boundsModel.bounds, focusModel.animationCenterScale, geometry)"/></div></div>',
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
                $parentCtrl.scope.$watch("featureCommands", function(val) { $scope.featureCommands = val || defaultFeatureCommands; });
                
                $scope.$watch("MAX_SCALE", function(val) { $scope.maxScale = angular.isDefined(val) ? Number(val) : Number.MAX_VALUE; });
                
                $scope.intersectsEnvelope = function(item) {
                    var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                    return itemEnvelope.intersects($scope.envelopeModel.getAnimationEnvelope());
                };
                
                $scope.mouseOverHandler = function(feature, event) {
                    $scope.featureCommands[0].perform(feature);
                };
                $scope.mouseOutHandler = function(feature, event) {
                    $scope.featureCommands[1].perform(feature);
                };
                $scope.clickHandler = function(feature, event) {
                    $scope.featureCommands[2].perform(feature);
                };
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
                };
                
                $scope.getCSS = (new CSSConverter()).pointToPixCSS;
            }
        };
    });
}
