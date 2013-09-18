angular.module('nine-e', ['monospaced.mousewheel']).
    directive('map', function factory() {
        var directiveDefinitionObject = {
            template: '<div class="mapviewer" msd-wheel="zoomm(); $event.preventDefault();" ng-mousedown="blaaa($event); $event.preventDefault();" ng-mouseup="blaaa($event);" ng-mousemove="blaaa($event);" ng-transclude/>',
            replace: true,
            restrict: 'E',
            scope: {
                focusModel: '=focusmodel'
            },
            controller: ['$scope', function($scope) {
                $scope.zoomm = function() {
                    var cs = $scope.focusModel.centerScale;
                    $scope.focusModel.setAnimationCenterScale(new CenterScale(cs.centerX, cs.centerY, cs.scale / 2));
                };
                $scope.blaaa = function(mouseEvent) {
                    console.log((mouseEvent.pageX - mouseEvent.currentTarget.offsetLeft) + " " + (mouseEvent.pageY - mouseEvent.currentTarget.offsetTop));
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