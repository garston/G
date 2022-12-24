GASton.Database = {};
GASton.Database._cache = {};

GASton.Database.findBy = function(clazz, prop, value){
    return this.hydrate(clazz).find(o => o[prop] === value);
};

GASton.Database.hydrate = function(clazz){
    if(!this._getCache(clazz)) {
        clazz.__hydrating = true;
        const values = this._getSheet(clazz).getDataRange().getValues();
        this._cache[clazz.__tableName] = JSUtil.ObjectUtil.equal(values, [['']]) ?  [] : values.
            filter(function(rowData, rowIndex){ return rowIndex + 1 >= clazz.__firstRow; }).
            map(function(rowData){
                var o = new clazz();
                o.__values = rowData.slice();
                return o;
            });
        delete clazz.__hydrating;
    }

    return this._getCache(clazz);
};

GASton.Database.register = function(clazz, tableName, props, hasHeaders){
    clazz.__firstRow = hasHeaders ? 2 : 1;
    clazz.__tableName = tableName;

    props.forEach(function(prop, propIndex){
        if(!prop) {
            return;
        }

        Object.defineProperty(clazz.prototype, prop, {
            get: function(){ return this.__values[propIndex]; },
            set: function(val){
                if(clazz.__hydrating){
                    return;
                }

                if (!this.__values){
                    GASton.Database.hydrate(clazz).push(this);

                    var newRow = props.map(function(prop, i){ return i === propIndex ? val : ''; });
                    GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.INSERT} ${tableName} - ${JSON.stringify(newRow)}`) &&
                        GASton.Database._getSheet(clazz).appendRow(newRow.slice());
                    this.__values = newRow;
                }else if(this.__values[propIndex] !== val){
                    var rowIndex = GASton.Database._getRowIndex(clazz, this);
                    GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.UPDATE} ${tableName}:${rowIndex} - ${prop}: ${this.__values[propIndex]} -> ${val}`) &&
                        GASton.Database._getSheet(clazz).getRange(rowIndex, propIndex + 1).setValue(val);
                    this.__values[propIndex] = val;
                }
            }
        });
    });
};

GASton.Database.remove = function(o){
    var clazz = o.constructor;
    GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.DELETE} ${clazz.__tableName}:${this._getRowIndex(clazz, o)}`) &&
        this._getSheet(clazz).deleteRow(this._getRowIndex(clazz, o));
    JSUtil.ArrayUtil.remove(this._getCache(clazz), o);
};

GASton.Database._getCache = function(clazz){ return this._cache[clazz.__tableName]; };
GASton.Database._getRowIndex = function(clazz, o){ return this._getCache(clazz).indexOf(o) + clazz.__firstRow; };
GASton.Database._getSheet = function (clazz){ return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName); };
