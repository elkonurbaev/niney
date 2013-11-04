angular.module('nine-e', ['monospaced.mousewheel']).
    directive('map', function factory($document) {
        var directiveDefinitionObject = {
            template: '<div class="mapviewer" ng-mousedown="mouseDownHandler($event)" msd-wheel="mouseWheelHandler($event, $delta)" ng-transclude/>',
            replace: true,
            restrict: 'E',
            scope: {
                boundsModel: '=boundsmodel',
                focusModel: '=focusmodel',
                envelopeModel: '=envelopemodel',
                serviceModel: '=servicemodel'
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
                this.scope.curServiceModel = null;
            }],
            compile: function (element, attr, transclude) {
                return function ($scope, $element, $attr, $parentCtrl) {
                    $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                    $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                    $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                    $parentCtrl.scope.$watch('serviceModel', function(val) { $scope.serviceModel = val; });
                    
                    var childElement, childScope;
                    var defaultInfoText = document.getElementById('infoPanel').innerHTML;
                    $scope.$watch('layer.visible', function(val) {
                        if (childElement) {
                        	if($scope.curServiceModel != null) {
                        		if($scope.curServiceModel.id == $scope.layer.id) {
                        			document.getElementById('infoPanel').innerHTML = defaultInfoText;
                        		}
                        	}
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
                }
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
            
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('serviceModel', function(val) { $scope.serviceModel = val; });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    }).
    directive('imagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.centerScale.scale"><img ng-repeat="feature in featureModel.features | filter:isInsideBoundaries" ng-mouseover="highlightSymbolizer($event)" ng-mouseout="unhighlightSymbolizer($event)" ng-click="showInfo(feature, $event)" src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.centerScale.getPixY(boundsModel.bounds.height, feature.propertyValues[propertyIndex].y)}}px; left: {{focusModel.centerScale.getPixX(boundsModel.bounds.width, feature.propertyValues[propertyIndex].x)}}px"/></div>',
            restrict: 'E',
            require: '^mapfeaturelayer',
            replace: true,
            scope: {
                maxScale: '@maxscale',
                propertyIndex: '@propertyindex',
                assetPropertyIndex: '@assetpropertyindex',
                asset: '@asset'
            },
            controller: ['$scope', function($scope){
            	$scope.prevElement = null;
            	$scope.сurElement = null;
            	$scope.curServiceModel = null;
                $scope.isInsideBoundaries = function(item) {
                	var itemEnvelope = item.propertyValues[$scope.propertyIndex].getEnvelope();
                	return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.highlightSymbolizer = function(event) {
                	event.target.className = event.target.className + ' highlightSymbolizer';
                }
                $scope.unhighlightSymbolizer = function(event) {
                	if($scope.сurElement != event.target)  event.target.className = 'ng-scope'; 
                }
                $scope.showInfo = function(feature, event) {
               	 	$scope.сurElement = event.target;
                	if($scope.prevElement != null) $scope.prevElement.className = 'ng-scope';
                	event.target.className = event.target.className + ' highlightSymbolizer';
                	$scope.prevElement = event.target;
                	var domInfoPanel = document.getElementById('infoPanel');
               		domInfoPanel.innerHTML = '';
                	$scope.curServiceModel = this.getServiceByName(feature.featureType.name);
                	if ($scope.curServiceModel != null) {
                		var fields = ($scope.curServiceModel.infoFieldsToInclude.replace(' ', '')).split(',');
                		if ($scope.curServiceModel.selectionCommand == 'all') {
                			var k = 0;
                			for (var i = 0; i < fields.length; ++i) {
                				var html = feature.propertyValues[fields[i]];
                				if(html != null){
      
                					if(this.isURL(html)) {
                						var textLink = ($scope.curServiceModel.customLinkTitles != null) ? $scope.curServiceModel.customLinkTitles[k] : 'link';
                						html = this.createLinkTag(html, textLink);
                						++k;
                					} else {
                						html = this.createTag(html, 'span');
                					}
                					domInfoPanel.appendChild(html);
                				}
                			}
                		} else if ($scope.curServiceModel.selectionCommand == 'url') {
                			window.open(feature.propertyValues[fields[0]]);
                		} 
                	}
                };
                /* option to put them inside root directive, instead of duplicating */
                $scope.getServiceByName = function(name) {
                	for(var i = 0; i < $scope.serviceModel.length; ++i) {
                		if(name == $scope.serviceModel[i].featureName) {
                			return $scope.serviceModel[i];
                		}
                	}
                	return nil;
                };
                $scope.createTag = function(val, type='span', newLine=true) {
                	var tag = document.createElement(type);
                	var textWithBreaks = val.split(/\[0A\]/);
                	var a_link = val.substring(val.indexOf('[link]')+('[link]').length, val.indexOf('[text]'));
                	var a_text = val.substring(val.indexOf('[text]')+('[text]').length, val.indexOf('[end]'));
                	//var regex = new RegExp(/(\[link\])(.*?)(\[text\])/g);
                	//var ss = val.match(regex);
                	if(this.isURL(a_link) && a_text != '') {
                		return this.createLinkTag(a_link, a_text);
                	}
                	for(var i = 0; i < textWithBreaks.length; ++i) {
                		tag.appendChild(document.createTextNode(textWithBreaks[i]));
                		if((i+1) != textWithBreaks.length) tag.appendChild(document.createElement('br'));
                	}
                	(newLine) ? tag.appendChild(document.createElement('br')) : null;
                	return tag;
                };
                $scope.createLinkTag = function(val, text, newLine=true) {
                	var tag = document.createElement('a');
                	tag.appendChild(document.createTextNode(text));
                	tag.href = val;
                	tag.target = "_blank";
                	(newLine) ? tag.appendChild(document.createElement('br')) : null;
                	return tag;
                };
                $scope.isURL = function(str) { 
               		var regexp = new RegExp("^s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+$");
               		return regexp.test(str);
				}
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
           		$parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('serviceModel', function(val) { $scope.serviceModel = val; });
                $scope.$watch('prevElement', function(val) { 
                	if($scope.curServiceModel != null) {
                		$parentCtrl.scope.curServiceModel = $scope.curServiceModel;
                	}
                });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    }).
    directive('geometryimagesymbolizer', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapfeaturelayer" ng-if="maxScale >= focusModel.centerScale.scale"><div ng-repeat="feature in featureModel.features" ng-mouseover="highlightSymbolizer($event)" ng-mouseout="unhighlightSymbolizer($event)" ng-click="showInfo(feature, $event)"><img ng-repeat="geometry in feature.propertyValues[propertyIndex].geometries | filter:isInsideBoundaries track by $index"  src="{{asset.replace(\'$\', feature.propertyValues[assetPropertyIndex])}}" style="position: absolute; top: {{focusModel.centerScale.getPixY(boundsModel.bounds.height, geometry.y)}}px; left: {{focusModel.centerScale.getPixX(boundsModel.bounds.width, geometry.x)}}px" /></div></div>',
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
            	$scope.prevElement = null;
            	$scope.сurElement = null;
            	$scope.curServiceModel = null;
                $scope.isInsideBoundaries = function(item) {
                	var itemEnvelope = item.getEnvelope();
                	return itemEnvelope.intersects($scope.envelopeModel.getEnvelope());
                };
                $scope.showInfo = function(feature) {
                	console.log('showInfo C ' + feature.propertyValues[0]);
                }
                $scope.highlightSymbolizer = function(event) {
                	event.target.className = event.target.className + ' highlightSymbolizer';
                }
                $scope.unhighlightSymbolizer = function(event) {
                	if($scope.сurElement != event.target)  event.target.className = 'ng-scope'; 
                }
                $scope.showInfo = function(feature, event) {
               	 	$scope.сurElement = event.target;
                	if($scope.prevElement != null) $scope.prevElement.className = 'ng-scope';
                	event.target.className = event.target.className + ' highlightSymbolizer';
                	$scope.prevElement = event.target;
                	var domInfoPanel = document.getElementById('infoPanel');
               		domInfoPanel.innerHTML = '';
                	$scope.curServiceModel = this.getServiceByName(feature.featureType.name);
                	if ($scope.curServiceModel != null) {
                		var fields = ($scope.curServiceModel.infoFieldsToInclude.replace(' ', '')).split(',');
                		if ($scope.curServiceModel.selectionCommand == 'all') {
                			var k = 0;
                			for (var i = 0; i < fields.length; ++i) {
                				var html = feature.propertyValues[fields[i]];
                				if(html != null){
                					if(this.isURL(html)) {
                						var textLink = ($scope.curServiceModel.customLinkTitles != null) ? $scope.curServiceModel.customLinkTitles[k] : 'link';
                						html = this.createLinkTag(html, textLink);
                						++k;
                					} else {
                						html = this.createTag(html, 'span');
                					}
                					domInfoPanel.appendChild(html);
                				}
                			}
                		} else if ($scope.curServiceModel.selectionCommand == 'url') {
                			window.open(feature.propertyValues[fields[0]]);
                		} 
                	}
                };
                /* option to put them inside root directive, instead of duplicating */
                $scope.getServiceByName = function(name) {
                	for(var i = 0; i < $scope.serviceModel.length; ++i) {
                		if(name == $scope.serviceModel[i].featureName) {
                			return $scope.serviceModel[i];
                		}
                	}
                	return nil;
                };
                $scope.createTag = function(val, type='span', newLine=true) {
                	var tag = document.createElement(type);
                	var textWithBreaks = val.split(/\[0A\]/);
                	var a_link = val.substring(val.indexOf('[link]')+('[link]').length, val.indexOf('[text]'));
                	var a_text = val.substring(val.indexOf('[text]')+('[text]').length, val.indexOf('[end]'));
                	//var regex = new RegExp(/(\[link\])(.*?)(\[text\])/g);
                	//var ss = val.match(regex);
                	if(this.isURL(a_link) && a_text != '') {
                		return this.createLinkTag(a_link, a_text);
                	}
                	for(var i = 0; i < textWithBreaks.length; ++i) {
                		tag.appendChild(document.createTextNode(textWithBreaks[i]));
                		if((i+1) != textWithBreaks.length) tag.appendChild(document.createElement('br'));
                	}
                	(newLine) ? tag.appendChild(document.createElement('br')) : null;
                	return tag;
                };
                $scope.createLinkTag = function(val, text, newLine=true) {
                	var tag = document.createElement('a');
                	tag.appendChild(document.createTextNode(text));
                	tag.href = val;
                	tag.target = "_blank";
                	(newLine) ? tag.appendChild(document.createElement('br')) : null;
                	return tag;
                };
                $scope.isURL = function(str) { 
               		var regexp = new RegExp("^s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+$");
               		return regexp.test(str);
				}
            }],
            link: function($scope, $element, $attr, $parentCtrl) {
                $parentCtrl.scope.$watch('boundsModel', function(val) { $scope.boundsModel = val; });
                $parentCtrl.scope.$watch('focusModel', function(val) { $scope.focusModel = val; });
                $parentCtrl.scope.$watch('featureModel', function(val) { $scope.featureModel = val; });
                $parentCtrl.scope.$watch('envelopeModel', function(val) { $scope.envelopeModel = val; });
                $parentCtrl.scope.$watch('serviceModel', function(val) { $scope.serviceModel = val; });
                $scope.$watch('prevElement', function(val) { 
                	if($scope.curServiceModel != null) {
                		$parentCtrl.scope.curServiceModel = $scope.curServiceModel;
                	}
                });
                $attr.$observe('maxscale', function(val) { $scope.maxScale = angular.isDefined(val) ? val : Number.MAX_VALUE; });
            }
        };
        return directiveDefinitionObject;
    });

