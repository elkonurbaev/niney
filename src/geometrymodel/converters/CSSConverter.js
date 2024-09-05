export function CSSConverter() { }

CSSConverter.prototype.pointToPixCSS = function(bounds, centerScale, point, css) {
    var pixCSS = {
        left: Math.round(centerScale.getPixX(bounds.width, point.x)) + "px",
        top: Math.round(centerScale.getPixY(bounds.height, point.y)) + "px"
    };
    
    if (css == null) {
        return pixCSS;
    }
    
    var propertyNames = ["fontSize", "fontFamily", "fontWeight", "color", "textShadow"];
    for (var i = 0; i < propertyNames.length; i++) {
        var propertyName = propertyNames[i];
        if (css[propertyName] != null) {
            pixCSS[propertyName] = css[propertyName];
        }
    }
    
    return pixCSS;
}

CSSConverter.prototype.pointToWorldCSS = function(point, css) {
    var worldCSS = {
        left: Math.round(point.x) + "px",
        top: Math.round(point.y) + "px"
    };
    
    if (css == null) {
        return worldCSS;
    }
    
    var propertyNames = ["fontSize", "fontFamily", "fontWeight", "color", "textShadow"];
    for (var i = 0; i < propertyNames.length; i++) {
        var propertyName = propertyNames[i];
        if (css[propertyName] != null) {
            worldCSS[propertyName] = css[propertyName];
        }
    }
    
    return worldCSS;
}

