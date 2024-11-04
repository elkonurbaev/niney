export function Filter(propertyIndexOrName, value, operator) {
    this.propertyIndex = (typeof propertyIndexOrName == "number"? propertyIndexOrName: null);
    this.propertyName = (typeof propertyIndexOrName == "string"? propertyIndexOrName: null);
    this.value = (parseFloat(value) == value)? parseFloat(value): value;
    this.operator = (operator.toUpperCase() == "IN")? FilterModel.IN: (operator == "<=")? FilterModel.LESS_OR_EQUALS: (operator == ">=")? FilterModel.GREATER_OR_EQUALS: FilterModel.EQUALS;
    this.title = null;
}

