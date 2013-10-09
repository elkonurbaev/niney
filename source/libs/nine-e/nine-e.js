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
    }
);
