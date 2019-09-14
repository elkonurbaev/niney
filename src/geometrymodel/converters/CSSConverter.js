export function CSSConverter() { }

CSSConverter.prototype.pointToPixCSS = function(bounds, centerScale, point) {
    return css = {
        left: Math.round(centerScale.getPixX(bounds.width, point.x)) + "px",
        top: Math.round(centerScale.getPixY(bounds.height, point.y)) + "px"
    };
}

CSSConverter.prototype.pointToWorldCSS = function(point) {
    return css = {
        left: Math.round(point.x) + "px",
        top: Math.round(point.y) + "px"
    };
}

