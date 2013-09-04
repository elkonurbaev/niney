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
    });



function Envelope(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
}

Envelope.prototype.getWidth = function() {
    return this.maxX - this.minX;
}

Envelope.prototype.getHeight = function() {
    return this.maxY - this.minY;
}



function CenterScale(centerX, centerY, scale) {
    this.coordPixFactor = 0.000352778;
    this.centerX = centerX;
    this.centerY = centerY;
    this.scale = scale;
}

CenterScale.prototype.equals = function(centerScale) {
    if (centerScale == null) {
        return false;
    }
    if ((this.centerX == centerScale.centerX) &&
        (this.centerY == centerScale.centerY) &&
        (this.scale == centerScale.scale)) {
            return true;
    }
    return false;
}

CenterScale.prototype.clone = function() {
    return new CenterScale(this.centerX, this.centerY, this.scale);
}

CenterScale.prototype.toEnvelope = function(width, height) {
    var numHorzCoords = width * this.coordPixFactor * this.scale;
    var numVertCoords = height * this.coordPixFactor * this.scale;
    var minX = this.centerX - numHorzCoords / 2;
    var minY = this.centerY - numVertCoords / 2;
    var maxX = minX + numHorzCoords;
    var maxY = minY + numVertCoords;
    return new Envelope(minX, minY, maxX, maxY);
}

CenterScale.prototype.getPixX = function(width, worldX) {
    var pixX = (worldX - this.centerX) / (this.coordPixFactor * this.scale);
    pixX = pixX + (width / 2);
    return pixX;
}

CenterScale.prototype.getPixY = function(height, worldY) {
    var pixY = (0 - worldY + this.centerY) / (this.coordPixFactor * this.scale);
    pixY = pixY + (height / 2);
    return pixY;
}



function FocusModel() {
    this.timer = null;
    this.centerScale = null;
    this.centerScales = null;
}

FocusModel.prototype.setAnimationCenterScale = function(animationCenterScale) {
    this.timer.reset();

    var focusModel = this;
    this.timer.timerHandler = function() {
        focusModel.centerScale = focusModel.centerScales[focusModel.timer.currentCount];
    };
    
    if ((this.centerScale == null)/* || (this.centerScale.equals(animationCenterScale))*/) {
        this.centerScale = animationCenterScale;
    } else {
        var dCenterX = (animationCenterScale.centerX - this.centerScale.centerX) / this.timer.numRepeats;
        var dCenterY = (animationCenterScale.centerY - this.centerScale.centerY) / this.timer.numRepeats;
        var dScale = (animationCenterScale.scale - this.centerScale.scale) / this.timer.numRepeats;
        this.centerScales = [];
        for (var i = 0; i < this.timer.numRepeats; i++) {
            this.centerScales.push(new CenterScale(
                this.centerScale.centerX + (-dCenterX / this.timer.numRepeats * i * i + (dCenterX + dCenterX) * i),
                this.centerScale.centerY + (-dCenterY / this.timer.numRepeats * i * i + (dCenterY + dCenterY) * i),
                this.centerScale.scale + (-dScale / this.timer.numRepeats * i * i + (dScale + dScale) * i)
            ));
        }
        this.centerScales.push(animationCenterScale); // For this one: i == numRepeats
        this.centerScale = this.centerScales[0];
        
        this.timer.start();
    }
}



function ZoomLevel(zoomLevel, scale, resolution) {
    this.zoomLevel = zoomLevel;
    this.scale = scale;
    this.resolution = resolution;
}



var zoomLevels = [
    new ZoomLevel(0, 443744272.72414012, 156543.0339),
    new ZoomLevel(1, 221872136.36207006, 78271.51695),
    new ZoomLevel(2, 110936068.18103503, 39135.758475),
    new ZoomLevel(3, 55468034.090517517, 19567.8792375),
    new ZoomLevel(4, 27734017.045258758, 9783.93961875),
    new ZoomLevel(5, 13867008.522629379, 4891.969809375),
    new ZoomLevel(6, 6933504.261314690, 2445.9849046875),
    new ZoomLevel(7, 3466752.130657345, 1222.99245234375),
    new ZoomLevel(8, 1733376.065328672, 611.496226171875),
    new ZoomLevel(9, 866688.0326643360, 305.7481130859375),
    new ZoomLevel(10, 433344.01633216810, 152.87405654296876),
    new ZoomLevel(11, 216672.00816608404, 76.43702827148438),
    new ZoomLevel(12, 108336.00408304202, 38.21851413574219),
    new ZoomLevel(13, 54168.002041521010, 19.109257067871095),
    new ZoomLevel(14, 27084.001020760505, 9.554628533935547),
    new ZoomLevel(15, 13542.000510380252, 4.777314266967774),
    new ZoomLevel(16, 6771.0002551901260, 2.388657133483887),
    new ZoomLevel(17, 3385.5001275950630, 1.1943285667419434),
    new ZoomLevel(18, 1692.7500637975315, 0.5971642833709717),
    new ZoomLevel(19, 846.37503189876580, 0.2985821416854859),
    new ZoomLevel(20, 423.18751594938290, 0.1492910708427429)
];

function getZoomLevel(scale, round) {
    var zoomLevel = null;
    for (var i = 0; i < zoomLevels.length - 1; i++) {
        zoomLevel = zoomLevels[i];
        
        if (!round) {
            if (scale >= zoomLevel.scale) {
                return zoomLevel;
            }
        } else {
            if (scale >= (zoomLevel.scale + zoomLevels[i + 1].scale) / 2) {
                return zoomLevel;
            }
        }
    }
    return zoomLevels[zoomLevels.length - 1];
}



function TileModel() {
    this.bounds = null;
    this.centerScale = null;
    this.tileWidth = 256;
    this.tileHeight = 256;
    this.urlBase = "http://www.waterfootprintassessmenttool.org/tiles/example/";
    this.urlExtension = "$Z/$X/$Y.png";
    this.maxX = 20037508.3427892;
    this.maxY = 20037508.3427892;
    this.tileZ = -1;
    this.tiles = [];
}

TileModel.prototype.setBounds = function(bounds) {
    if (bounds == null) {
        return;
    }
    if (bounds.equals(this.bounds)) {
        return;
    }
    
    this.bounds = bounds;
    
    this.resetLoaders();
}

TileModel.prototype.setCenterScale = function(centerScale) {
    this.centerScale = centerScale;
    
    this.resetLoaders();
}

TileModel.prototype.resetLoaders = function() {
    if (this.bounds == null) {
        return;
    }
    if (this.centerScale == null) {
        return;
    }
    
    var envelope = this.centerScale.toEnvelope(this.bounds.width, this.bounds.height);
    var zoomLevel = getZoomLevel(this.centerScale.scale);
    var tileZ = zoomLevel.zoomLevel;
    var tileScale = zoomLevel.scale;
    var resolution = zoomLevel.resolution;
    var tileLimit = Math.pow(2, tileZ);
    var leftTileX = Math.floor((envelope.minX + this.maxX) / resolution / this.tileWidth);
    var topTileY = Math.max(Math.floor((this.maxY - envelope.maxY) / resolution / this.tileHeight), 0);
    var rightTileX = Math.floor((envelope.maxX + this.maxX) / resolution / this.tileWidth);
    var bottomTileY = Math.min(Math.floor((this.maxY - envelope.minY) / resolution / this.tileHeight), tileLimit - 1);
    
    if (this.tileZ != tileZ) {
        this.tileZ = tileZ;
        this.tiles = [];
    }
    
    var minX = -1;
    var maxY = -1;
    var url = null;
    var dX = -1;
    var dY = -1;
    var scaling = 1;
    var tile = null;
    
    var i = 0;
    for (var tileY = topTileY; tileY <= bottomTileY; tileY++) {
        for (var tileX = leftTileX; tileX <= rightTileX; tileX++) {
            minX = tileX * this.tileWidth * resolution - this.maxX;
            maxY = -(tileY * this.tileHeight * resolution - this.maxY);
            
            url = this.urlExtension;
            url = url.replace("$Z", tileZ);
            url = url.replace("$X", ((tileX % tileLimit) + tileLimit) % tileLimit);
            url = url.replace("$Y", tileY);
            
            dX = this.centerScale.getPixX(this.bounds.width, minX);
            dY = this.centerScale.getPixY(this.bounds.height, maxY);
            scaling = tileScale / this.centerScale.scale;
            var wi = this.tileWidth * scaling;
            var he = this.tileHeight * scaling;
            
            while (
                    (i < this.tiles.length) &&
                    ((this.tiles[i].tileY < tileY) || ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX < tileX)))
            ) {
                this.tiles.splice(i, 1);
            }
            
            tile = null;
            if (i >= this.tiles.length) {
                this.tiles.push(new Tile(tileX, tileY, url, dX, dY, wi, he));
            } else if ((this.tiles[i].tileY == tileY) && (this.tiles[i].tileX == tileX)) {
                tile = this.tiles[i];
                tile.x = dX;
                tile.y = dY;
                tile.width = wi;
                tile.height = he;
            } else {
                this.tiles.splice(i, 0, new Tile(tileX, tileY, url, dX, dY, wi, he));
            }
            i++;
        }
    }
    this.tiles.splice(i, this.tiles.length - i);
}

function Tile(tileX, tileY, url, x, y, width, height) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.url = url;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Tile.prototype.toCSS = function() {
    return {top: this.y + "px", left: this.x + "px", width: this.width + "px", height: this.height + "px"};
}

/* incomplete */

function FeatureModel(data) {
    this.features = data;
    this.point = null;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function CSVServiceConnector(fieldSeparator, textDelimeter, url) {
    this.fieldSeparator = fieldSeparator;
    this.textDelimeter = textDelimeter;
    this.url = url;
    this.featureModel = null;
}

CSVServiceConnector.prototype.load = function(){
  	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = process;
	xhr.open("GET", this.url, true);
	xhr.send();

	function process(){		
 		 if (xhr.readyState == 4){
  			this.featureModel = new FeatureModel(xhr.responseText);
  		}
	}
} 
CSVServiceConnector.prototype.csvToFeatures = function(data){
	 return data.splice(this.fieldSeparator);
}

