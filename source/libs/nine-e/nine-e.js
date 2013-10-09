angular.module('nine-e', ['monospaced.mousewheel']).
    directive('map', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapviewer" msd-wheel="zoomm($event, $delta); $event.preventDefault();" ng-mousedown="mouseDownHandler($event); $event.preventDefault();" ng-mousemove="mouseMoveHandler1($event);" ng-mouseup="mouseUpHandler($event);" ng-transclude/>',
            replace: true,
            restrict: 'E',
            scope: {
                focusModel: '=focusmodel'
            },
            controller: ['$scope', function($scope) {
                $scope.mouseDownX = -1;
                $scope.mouseDownY = -1;
                $scope.panning = false;
                
                $scope.mouseDownHandler = function(mouseEvent) {
                    $scope.mouseDownX = mouseEvent.pageX;
                    $scope.mouseDownY = mouseEvent.pageY;
                    $scope.panning = true;
                }
                
                $scope.mouseMoveHandler1 = function(mouseEvent) {
                    if ($scope.panning != true) return;
                    
                    var centerScale = $scope.focusModel.centerScale;
                    var dx = centerScale.getNumWorldCoords(mouseEvent.pageX - $scope.mouseDownX);
                    var dy = centerScale.getNumWorldCoords(mouseEvent.pageY - $scope.mouseDownY);
                    
                    $scope.focusModel.pan(-dx, dy);
                    
                    $scope.mouseDownX = mouseEvent.pageX;
                    $scope.mouseDownY = mouseEvent.pageY;
                }
                
                $scope.mouseUpHandler = function(mouseEvent) {
                    $scope.panning = false;
                    $scope.mouseDownX = -1;
                    $scope.mouseDownY = -1;
                }
                
                $scope.zoomm = function(event, delta) {
                    var cs = $scope.focusModel.centerScale;
                    $scope.focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / Math.pow(2, delta)));
                };
                $scope.blaaa = function(mouseEvent) {
                    //console.log((mouseEvent.pageX - mouseEvent.currentTarget.offsetLeft) + " " + (mouseEvent.pageY - mouseEvent.currentTarget.offsetTop));
                }
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
