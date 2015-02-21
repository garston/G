Database = {};

Database.hasObject = function(clazz, colNameValuePairs){
    return !!this._getRowNumBy(clazz, colNameValuePairs);
};

Database.hydrate = function(clazz, guid){
    return this.hydrateBy(clazz, ['guid', guid]);
};

Database.hydrateAll = function(clazz){
    return ArrayUtil.map(ArrayUtil.range(this._getFirstRow(clazz), this._getLastRow(clazz) + 1), function(row){
        return this._hydrateRow(clazz, row);
    }, this);
};

Database.hydrateAllBy = function(clazz, colNameValuePairs){
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

Database.hydrateBy = function(clazz, colNameValuePairs, _startRow){
    var row = this._getRowNumBy(clazz, colNameValuePairs, _startRow);
    if(row){
        return this._hydrateRow(clazz, row);
    }
};

Database.hydrateMultiple = function(clazz, guids){
    return ArrayUtil.map(guids, function(guid){
        return this.hydrate(clazz, guid);
    }, this);
};

Database.persist = function(clazz, o){
    if(o.__row){
        this._persistUpdateAllProperties(clazz, o);
    }else{
        this._persistNew(clazz, o);
    }
};

Database.persistOnly = function(clazz, o, properties){
    ArrayUtil.forEach(properties, function(property){
        this._persistProperty(clazz, o, property);
    }, this);
};

Database.remove = function(clazz, o){
    if(PROD_MODE){
        this._getSheet(clazz).deleteRow(o.__row);
    } else {
        Logger.log('DELETE %s:%s', clazz.__tableName, o.__row);
    }
};

Database._getCell = function(clazz, row, colName){
    return this._getSheet(clazz).getRange(row, clazz.__propsToCol[colName]);
};

Database._getCellValue = function(clazz, row, colName){
    return this._getCell(clazz, row, colName).getValue();
};

Database._getFirstRow = function(clazz){
    return clazz.__firstRow || 1;
};

Database._getLastRow = function(clazz){
    return this._getSheet(clazz).getLastRow();
};

Database._getRowNumBy = function(clazz, colNameValuePairs, startRow){
    return ArrayUtil.find(ArrayUtil.range(startRow || this._getFirstRow(clazz), this._getLastRow(clazz) + 1), function(row){
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

Database._getSheet = function(clazz){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName);
};

Database._hydrateRow = function(clazz, row){
    var o = new clazz();
    o.__row = row;
    for(var prop in clazz.__propsToCol){
        o[prop] = this._getCellValue(clazz, row, prop);
    }
    return o;
};

Database._persistNew = function(clazz, o){
    var newRow = [];
    for(var prop in clazz.__propsToCol){
        newRow[clazz.__propsToCol[prop] - 1] = o[prop];
    }

    if(PROD_MODE){
        this._getSheet(clazz).appendRow(newRow);
    } else {
        Logger.log('INSERT %s - %s', clazz.__tableName, newRow);
    }
};

Database._persistProperty = function(clazz, o, property){
    if(PROD_MODE){
        this._getCell(clazz, o.__row, property).setValue(o[property]);
    } else {
        Logger.log('UPDATE %s:%s - %s: %s', clazz.__tableName, o.__row, property, o[property]);
    }
};

Database._persistUpdateAllProperties = function(clazz, o){
    for(var property in clazz.__propsToCol){
        this._persistProperty(clazz, o, property);
    }
};
