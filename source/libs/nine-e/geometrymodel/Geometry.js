function Geometry(){ 
	this.parent = null;
	this.envelope = null;
	
	/*this.__name = 'elchibek';
 	// add getter & setter methods //
    Object.defineProperty(this, "name", {
        get: function() {
        // additional getter logic
            return this.__name;
        },
        set: function(val) {
            this.__name = val;
        // additional setter logic
        }
    });*/
}

Geometry.prototype.setParent = function(parent){
	console.log("setParent");
	this.parent = parent;
}

Geometry.prototype.getParent = function(){
	console.log("getParent");
	return this.parent;
}

