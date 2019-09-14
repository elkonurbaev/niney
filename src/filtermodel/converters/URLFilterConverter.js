export function URLFilterConverter() { }

URLFilterConverter.prototype.filterModelsToURLFilter = function(filterModels) {
    var urlFilters = [];
    for (var i = 0; i < filterModels.length; i++) {
        if (filterModels[i].filter != null) {
            urlFilters.push(this.filterToURLFilter(filterModels[i].filter));
        }
    }
    
    return urlFilters.join(":::");
}

URLFilterConverter.prototype.filterToURLFilter = function(filter) {
    return filter.propertyName + "::EQ::" + filter.value;
}

