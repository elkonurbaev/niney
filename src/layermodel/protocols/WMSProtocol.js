export function WMSProtocol() { }

WMSProtocol.getMapURL = function(layer, srs, minX, minY, maxX, maxY, tileWidth, tileHeight, autoClassification, infoPoint) {
    var url = layer.baseURL;
    url += (url.indexOf("?") == -1? "?": "&") + "SERVICE=WMS";
    url += "&VERSION=1.1.1";
    url += "&REQUEST=" + (infoPoint == null? "GetMap": "GetFeatureInfo");
    
    if (layer.styleURL == null) {
        url += "&LAYERS=" + layer.name;
        url += "&STYLES=";
    } else {
        var sldURL = layer.styleURL;
        if (layer.name != null) {
            sldURL += "?layer=" + layer.name;
        }
        var urlFilter = (new URLFilterConverter()).filterModelsToURLFilter(layer.filterModels);
        if (urlFilter.length > 0) {
            sldURL += "&filter=" + urlFilter;
        }
        if (layer.classification != null) {
            sldURL += "&classification=" + encodeURIComponent(URLClassificationConverter.classificationToURLClassification(layer.classification));
            if ((urlFilter.length == 0) || (!autoClassification)) {
                sldURL += "::noFilter";
            }
        }
        url += "&SLD=" + encodeURIComponent(sldURL);
    }
    url += "&TRANSPARENT=true";
    url += "&SRS=EPSG:" + srs.srid;
    url += "&BBOX=" + minX + "," + minY + "," + maxX + "," + maxY;
    url += "&WIDTH=" + tileWidth;
    url += "&HEIGHT=" + tileHeight;
    url += "&FORMAT=" + layer.format;
    url += "&EXCEPTIONS=application/vnd.ogc.se_xml";
    
    if (infoPoint != null) {
        url += "&QUERY_LAYERS=" + layer.name;
        url += "&X=" + infoPoint.x;
        url += "&Y=" + infoPoint.y;
    }
    
    for (var key in layer.vendorSpecifics) {
        url += "&" + key + "=" + layer.vendorSpecifics[key];
    }
    
    return url;
}

