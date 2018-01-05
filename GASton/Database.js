GASton.Database = {};
GASton.Database._cache = {};

GASton.Database.findBy = function(clazz, prop, value){
    return JSUtil.ArrayUtil.find(this.hydrate(clazz), function(o){ return o[prop] === value; });
};

GASton.Database.hydrate = function(clazz){
    var objs = this._getCache(clazz) || this._getSheet(clazz).getDataRange().getValues().
        filter(function(rowData, rowIndex){ return rowIndex + 1 >= this._getFirstRow(clazz); }, this).
        map(function(rowData){
            var o = new clazz();
            clazz.__props.forEach(function(prop, propIndex){
                if(prop){
                    o[prop] = rowData[propIndex];
                }
            });
            this._overwriteDbValuesCache(clazz, o);
            return o;
        }, this);
    this._cache[clazz.__tableName] = objs;
    return objs;
};

GASton.Database.persist = function(o){
    var clazz = o.constructor;
    if (JSUtil.ArrayUtil.contains(this._getCache(clazz) || [], o)) {
        this._persistUpdate(clazz, o);
    }else{
        this._persistNew(clazz, o);
    }
    return o;
};

GASton.Database.remove = function(o){
    var clazz = o.constructor;
    GASton.checkProdMode('DELETE %s:%s', [clazz.__tableName, this._getRowIndex(clazz, o)]) &&
        this._getSheet(clazz).deleteRow(this._getRowIndex(clazz, o));
    JSUtil.ArrayUtil.remove(this._getCache(clazz), o);
};

GASton.Database._getCache = function(clazz){ return this._cache[clazz.__tableName]; };
GASton.Database._getFirstRow = function(clazz){ return clazz.__firstRow || 1; };
GASton.Database._getRowIndex = function(clazz, o){ return this._getCache(clazz).indexOf(o) + this._getFirstRow(clazz); };
GASton.Database._getSheet = function (clazz){ return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName); };

GASton.Database._overwriteDbValuesCache = function(clazz, o) {
    o.__dbValues = {};
    clazz.__props.
        filter(function(prop){ return prop; }).
        forEach(function(prop){ o.__dbValues[prop] = o[prop]; });
};

GASton.Database._persistNew = function(clazz, o){
    this.hydrate(clazz).push(o);

    var newRow = clazz.__props.map(function(prop){ return prop ? o[prop] : ''; });
    GASton.checkProdMode('INSERT %s - %s', [clazz.__tableName, newRow]) &&
        this._getSheet(clazz).appendRow(newRow);
    this._overwriteDbValuesCache(clazz, o);
};

GASton.Database._persistUpdate = function(clazz, o){
    var rowIndex = this._getRowIndex(clazz, o);
    clazz.__props.forEach(function(prop, propIndex){
        if(!prop || o[prop] === o.__dbValues[prop]) {
            return;
        }

        GASton.checkProdMode('UPDATE %s:%s - %s: %s', [clazz.__tableName, rowIndex, prop, o[prop]]) &&
            this._getSheet(clazz).getRange(rowIndex, propIndex + 1).setValue(o[prop]);
        o.__dbValues[prop] = o[prop];
    }, this);
};
