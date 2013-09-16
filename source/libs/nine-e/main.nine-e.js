jsimport = function(url) {
    var _head = document.getElementsByTagName("head")[0];         
    var _script = document.createElement('script');
    _script.type = 'text/javascript';
    _script.src = url;
    _head.appendChild(_script);
}

jsimport("libs/nine-e/geometrymodel/Geometry.js");
jsimport("libs/nine-e/geometrymodel/GeometryCollection.js");
jsimport("libs/nine-e/geometrymodel/Envelope.js");
jsimport("libs/nine-e/geometrymodel/GeometryTools.js");
jsimport("libs/nine-e/geometrymodel/LineString.js");
jsimport("libs/nine-e/geometrymodel/Point.js");
jsimport("libs/nine-e/geometrymodel/Polygon.js");
jsimport("libs/nine-e/geometrymodel/WKTConverter.js");
jsimport("libs/nine-e/featuremodel/Feature.js");
jsimport("libs/nine-e/featuremodel/FeatureModel.js");
jsimport("libs/nine-e/featuremodel/FeatureType.js");
jsimport("libs/nine-e/featuremodel/Property.js");
jsimport("libs/nine-e/featuremodel/PropertyType.js");
jsimport("libs/nine-e/focusmodel/CenterScale.js");
jsimport("libs/nine-e/focusmodel/FocusModel.js");
jsimport("libs/nine-e/focusmodel/ZoomLevel.js");
jsimport("libs/nine-e/layermodel/Tile.js");
jsimport("libs/nine-e/layermodel/TileModel.js");
jsimport("libs/nine-e/service/CSVServiceConnector.js");
jsimport("libs/nine-e/app/mousewheel.js");
jsimport("libs/nine-e/app/utils.js");
jsimport("libs/nine-e/app/nine-e.js");
















