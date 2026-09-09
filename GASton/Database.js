namespace GASton {
    export namespace Database {
        type Cache<T extends BoundObject> = Record<BoundClass['__tableName'], T[] | undefined>;
        export let _cache: Cache<BoundObject> = {};

        export const clear = (clazz: BoundClass) => {
            checkProdMode(`${UPDATE_TYPES.DB.CLEAR} ${clazz.__tableName}`) &&
                _getSheet(clazz).clear();
            _setCache(clazz, []);
        };

        export const findBy = function<T extends BoundClass>(clazz: T, prop: BoundObjectProp, value: BoundObjectPropVal) {
            return hydrate(clazz).find(o => (o as Record<BoundObjectProp, BoundObjectPropVal>)[prop] === value);
        }

        export const hydrate = function<T extends BoundClass>(clazz: T) {
            if(!_getCache(clazz)) {
                clazz.__hydrating = true;
                const values: BoundObjectPropVal[][] = _getSheet(clazz).getDataRange().getValues();
                _setCache(clazz, JSUtil.ObjectUtil.equal(values, [['']]) ?  [] : values.
                    slice(clazz.__firstRow - 1).
                    map(rowData => {
                        const o = new clazz();
                        o.__values = rowData.slice();
                        return o;
                    })
                );
                delete clazz.__hydrating;
            }

            return _getCache(clazz)!;
        };

        export const register = function<T extends BoundClass>(clazz: T, tableName: string, props: (null | BoundObjectProp)[], hasHeaders?: boolean) {
            clazz.__firstRow = hasHeaders ? 2 : 1;
            clazz.__tableName = tableName;

            props.forEach((prop, propIndex) => {
                if(!prop) {
                    return;
                }

                Object.defineProperty(clazz.prototype, prop, {
                    get: function(){ return (this as BoundObject).__values![propIndex]; },
                    set: function(val){
                        if(clazz.__hydrating){
                            return;
                        }

                        const o: InstanceType<T> = this;
                        if (!o.__values){
                            hydrate(clazz).push(o);

                            const newRow = props.map((_prop, i) => i === propIndex ? val : '');
                            checkProdMode(`${UPDATE_TYPES.DB.INSERT} ${tableName} - ${JSON.stringify(newRow)}`) &&
                                _getSheet(clazz).appendRow(newRow.slice());
                            o.__values = newRow;
                        }else if(o.__values[propIndex] !== val){
                            const rowIndex = _getRowIndex(o);
                            checkProdMode(`${UPDATE_TYPES.DB.UPDATE} ${tableName}:${rowIndex} - ${prop}: ${o.__values[propIndex]} -> ${val}`) &&
                                _getSheet(clazz).getRange(rowIndex, propIndex + 1).setValue(val);
                            o.__values[propIndex] = val;
                        }
                    }
                });
            });
        };

        export const remove = (o: BoundObject) => {
            const clazz = _getClazz(o);
            checkProdMode(`${UPDATE_TYPES.DB.DELETE} ${clazz.__tableName}:${_getRowIndex(o)}`) &&
                _getSheet(clazz).deleteRow(_getRowIndex(o));
            JSUtil.ArrayUtil.remove(_getCache(clazz)!, o);
        };

        const _getCache = function<T extends BoundClass>(clazz: T) { return (_cache as Cache<InstanceType<T>>)[clazz.__tableName]};
        const _getClazz = (o: BoundObject) => o.constructor as BoundClass;

        const _getRowIndex = (o: BoundObject) => {
            const clazz = _getClazz(o);
            return _getCache(clazz)!.indexOf(o) + clazz.__firstRow;
        };

        const _getSheet = (clazz: BoundClass) => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName)!;

        const _setCache = (clazz: BoundClass, objs: BoundObject[]) => {
            _cache[clazz.__tableName] = objs;
        }
    }
}
