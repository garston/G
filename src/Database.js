GASton.Database = {};

GASton.Database.hasObject = function(clazz, colNameValuePairs){
    return !!this._getRowNumBy(clazz, colNameValuePairs);
};

GASton.Database.hydrate = function(clazz, guid){
    return this.hydrateBy(clazz, ['guid', guid]);
};

GASton.Database.hydrateAll = function(clazz){
    return JSUtil.ArrayUtil.map(JSUtil.ArrayUtil.range(this._getFirstRow(clazz), this._getLastRow(clazz) + 1), function(row){
        return this._hydrateRow(clazz, row);
    }, this);
};

GASton.Database.hydrateAllBy = function(clazz, colNameValuePairs){
    var records = [];

    var startRow = this._getFirstRow(clazz);
    while(true){
        var o = this.hydrateBy(clazz, colNameValuePairs, startRow);
        if(o){
            records.push(o);
            startRow = o.__row + 1;
        }else{
            return records;
        }
    }
};

GASton.Database.hydrateBy = function(clazz, colNameValuePairs, _startRow){
    var row = this._getRowNumBy(clazz, colNameValuePairs, _startRow);
    if(row){
        return this._hydrateRow(clazz, row);
    }
};

GASton.Database.hydrateMultiple = function(clazz, guids){
    return JSUtil.ArrayUtil.map(guids, function(guid){
        return this.hydrate(clazz, guid);
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
    JSUtil.ArrayUtil.forEach(properties, function(property){
        this._persistProperty(clazz, o, property);
    }, this);
};

GASton.Database.remove = function(clazz, o){
    if(GASton.PROD_MODE){
        this._getSheet(clazz).deleteRow(o.__row);
    } else {
        Logger.log('DELETE %s:%s', clazz.__tableName, o.__row);
    }
};

GASton.Database._getCell = function(clazz, row, colName){
    return this._getSheet(clazz).getRange(row, clazz.__propsToCol[colName]);
};

GASton.Database._getCellValue = function(clazz, row, colName){
    return this._getCell(clazz, row, colName).getValue();
};

GASton.Database._getFirstRow = function(clazz){
    return clazz.__firstRow || 1;
};

GASton.Database._getLastRow = function(clazz){
    return this._getSheet(clazz).getLastRow();
};

GASton.Database._getRowNumBy = function(clazz, colNameValuePairs, startRow){
    return JSUtil.ArrayUtil.find(JSUtil.ArrayUtil.range(startRow || this._getFirstRow(clazz), this._getLastRow(clazz) + 1), function(row){
        for(var nameValPair = 0; nameValPair < colNameValuePairs.length; nameValPair += 2){
            var colName = colNameValuePairs[nameValPair];
            var expectedValue = colNameValuePairs[nameValPair + 1];
            var actualValue = this._getCellValue(clazz, row, colName);
            if(expectedValue !== actualValue){
                return false;
            }
        }
        return true;
    }, this);
};

GASton.Database._getSheet = function(clazz){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName);
};

GASton.Database._hydrateRow = function(clazz, row){
    var o = new clazz();
    o.__row = row;
    for(var prop in clazz.__propsToCol){
        o[prop] = this._getCellValue(clazz, row, prop);
    }
    return o;
};

GASton.Database._persistNew = function(clazz, o){
    var newRow = [];
    for(var prop in clazz.__propsToCol){
        newRow[clazz.__propsToCol[prop] - 1] = o[prop];
    }

    if(GASton.PROD_MODE){
        this._getSheet(clazz).appendRow(newRow);
    } else {
        Logger.log('INSERT %s - %s', clazz.__tableName, newRow);
    }
};

GASton.Database._persistProperty = function(clazz, o, property){
    if(GASton.PROD_MODE){
        this._getCell(clazz, o.__row, property).setValue(o[property]);
    } else {
        Logger.log('UPDATE %s:%s - %s: %s', clazz.__tableName, o.__row, property, o[property]);
    }
};

GASton.Database._persistUpdateAllProperties = function(clazz, o){
    for(var property in clazz.__propsToCol){
        this._persistProperty(clazz, o, property);
    }
};
