function URLFilterConverter() { }

URLFilterConverter.filterModelsToURLFilter = function(filterModels) {
    var urlFilter = "";
    for (var i = 0; i < filterModels.length; i++) {
        if (filterModels[i] != null) {
            if (urlFilter.length > 0) {
                urlFilter += ":::";
            }
            urlFilter += URLFilterConverter.filterToURLFilter(filterModels[i].filter);
        }
    }
    
    return urlFilter;
}

URLFilterConverter.filterToURLFilter = function(filter) {
    var urlFilter = filter.propertyName + "::EQ::" + filter.value;
    
    return urlFilter;
}

