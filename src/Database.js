GASton.Database = {};

GASton.Database.hydrate = function(clazz){
    var firstRow = this._getClassMetadataValue(clazz, '__firstRow') || 1;
    return this._getSheet(clazz).getDataRange().getValues().
        filter(function(rowData, rowIndex){ return rowIndex + 1 >= firstRow; }).
        map(function(rowData, index){
            var o = new clazz();
            o.__row = index + firstRow;
            this._getClassMetadataValue(clazz, '__props').forEach(function(prop, propIndex){
                if(prop){
                    o[prop] = rowData[propIndex];
                }
            });
            return o;
        }, this);
};

GASton.Database.persist = function(clazz, o){
    if(o.__row){
        this._persistUpdateAllProperties(clazz, o);
    }else{
        this._persistNew(clazz, o);
    }
};

GASton.Database.persistOnly = function(clazz, o, properties){
    properties.forEach(function(property){
        this._persistProperty(clazz, o, property);
    }, this);
};

GASton.Database.remove = function(clazz, o){
    if(GASton.PROD_MODE){
        this._getSheet(clazz).deleteRow(o.__row);
    } else {
        Logger.log('DELETE %s:%s', this._getClassMetadataValue(clazz, '__tableName'), o.__row);
    }
};

GASton.Database._getClassMetadataValue = function(clazz, fieldName) {
    return typeof(clazz[fieldName]) === 'function' ? clazz[fieldName].call(clazz) : clazz[fieldName];
};

GASton.Database._getSheet = function(clazz){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this._getClassMetadataValue(clazz, '__tableName'));
};

GASton.Database._persistNew = function(clazz, o){
    var newRow = this._getClassMetadataValue(clazz, '__props').map(function(prop){ return prop ? o[prop] : ''; });

    if(GASton.PROD_MODE){
        this._getSheet(clazz).appendRow(newRow);
    } else {
        Logger.log('INSERT %s - %s', this._getClassMetadataValue(clazz, '__tableName'), newRow);
    }
};

GASton.Database._persistProperty = function(clazz, o, property){
    if(GASton.PROD_MODE){
        this._getSheet(clazz).getRange(o.__row, this._getClassMetadataValue(clazz, '__props').indexOf(property) + 1).setValue(o[property]);
    } else {
        Logger.log('UPDATE %s:%s - %s: %s', this._getClassMetadataValue(clazz, '__tableName'), o.__row, property, o[property]);
    }
};

GASton.Database._persistUpdateAllProperties = function(clazz, o){
    this._getClassMetadataValue(clazz, '__props').filter(function(prop){ return prop; }).forEach(function(property){
        this._persistProperty(clazz, o, property);
    }, this);
};
