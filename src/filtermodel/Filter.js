function Filter(propertyIndexOrName, value) {
    this.propertyIndex = (typeof propertyIndexOrName == "number"? propertyIndexOrName: null);
    this.propertyName = (typeof propertyIndexOrName == "string"? propertyIndexOrName: null);
    this.value = value;
}

