GASton.Database = {};
GASton.Database._cache = {};

GASton.Database.hydrate = function(clazz){
    this._cache[clazz] = this._cache[clazz] || this._getSheet(clazz).getDataRange().getValues().
        filter(function(rowData, rowIndex){ return rowIndex + 1 >= this._getFirstRow(clazz); }, this).
        map(function(rowData){
            var o = new clazz();
            this._getClassMetadataValue(clazz, '__props').forEach(function(prop, propIndex){
                if(prop){
                    o[prop] = rowData[propIndex];
                }
            });
            this._overwriteDbValuesCache(clazz, o);
            return o;
        }, this);
    return this._cache[clazz];
};

GASton.Database.persist = function(clazz, o){
    if(this._cache[clazz] && JSUtil.ArrayUtil.contains(this._cache[clazz], o)){
        this._persistUpdate(clazz, o);
    }else{
        this._persistNew(clazz, o);
    }
};

GASton.Database.remove = function(clazz, o){
    if(GASton.PROD_MODE){
        this._getSheet(clazz).deleteRow(this._getRowIndex(clazz, o));
    } else {
        Logger.log('DELETE %s:%s', this._getClassMetadataValue(clazz, '__tableName'), this._getRowIndex(clazz, o));
    }
    JSUtil.ArrayUtil.remove(this._cache[clazz], o);
};

GASton.Database._getClassMetadataValue = function(clazz, fieldName) { return typeof(clazz[fieldName]) === 'function' ? clazz[fieldName].call(clazz) : clazz[fieldName]; };
GASton.Database._getFirstRow = function(clazz){ return this._getClassMetadataValue(clazz, '__firstRow') || 1; };
GASton.Database._getRowIndex = function(clazz, o){ return this._cache[clazz].indexOf(o) + this._getFirstRow(clazz); };
GASton.Database._getSheet = function(clazz){ return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this._getClassMetadataValue(clazz, '__tableName')); };

GASton.Database._overwriteDbValuesCache = function(clazz, o) {
    o.__dbValues = {};
    this._getClassMetadataValue(clazz, '__props').
        filter(function(prop){ return prop; }).
        forEach(function(prop){ o.__dbValues[prop] = o[prop]; });
};

GASton.Database._persistNew = function(clazz, o){
    this.hydrate(clazz).push(o);

    var newRow = this._getClassMetadataValue(clazz, '__props').map(function(prop){ return prop ? o[prop] : ''; });
    if(GASton.PROD_MODE){
        this._getSheet(clazz).appendRow(newRow);
    } else {
        Logger.log('INSERT %s - %s', this._getClassMetadataValue(clazz, '__tableName'), newRow);
    }
    this._overwriteDbValuesCache(clazz, o);
};

GASton.Database._persistUpdate = function(clazz, o){
    var rowIndex = this._getRowIndex(clazz, o);
    this._getClassMetadataValue(clazz, '__props').forEach(function(prop, propIndex){
        if(!prop || o[prop] === o.__dbValues[prop]) {
            return;
        }

        if(GASton.PROD_MODE){
            this._getSheet(clazz).getRange(rowIndex, propIndex + 1).setValue(o[prop]);
        } else {
            Logger.log('UPDATE %s:%s - %s: %s', this._getClassMetadataValue(clazz, '__tableName'), rowIndex, prop, o[prop]);
        }
        o.__dbValues[prop] = o[prop];
    }, this);
};
