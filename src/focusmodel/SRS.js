function SRS() {
    this.srid = 900913;
    this.zoomLevels = [
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
    this.minX = -20037508.3427892;
    this.minY = -20037508.3427892;
    this.maxX = 20037508.3427892;
    this.maxY = 20037508.3427892;
}

SRS.prototype.getZoomLevel = function(scale, round) {
    if ((round === undefined) || (round === false) || (round == "DOWN")) {
        for (var i = 0; i < this.zoomLevels.length - 1; i++) {
            if (scale >= this.zoomLevels[i].scale) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[this.zoomLevels.length - 1];
    } else if ((round === true) || (round == "ROUND")) {
        for (var i = 0; i < this.zoomLevels.length - 1; i++) {
            if (scale >= (this.zoomLevels[i].scale + this.zoomLevels[i + 1].scale) / 2) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[this.zoomLevels.length - 1];
    } else {  // round == "UP"
        for (var i = this.zoomLevels.length - 1; i > 0; i--) {
            if (scale <= this.zoomLevels[i].scale) {
                return this.zoomLevels[i];
            }
        }
        return this.zoomLevels[0];
    }
}

