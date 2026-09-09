namespace GASton {
    export namespace Database {
        type BoundInstance = {
            constructor: RegisteredClass;
        };
        type BoundInstanceProp = string;

        type ClassType = new (...args: any) => any;
        type RegisteredClass = {
            __firstRow: number;
            __hydrating?: boolean;
            __tableName: string;
        } & ClassType;

        export let _cache: Record<string, BoundInstance[] | undefined> = {};

        export const clear = (clazz: RegisteredClass) => {
            GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.CLEAR} ${clazz.__tableName}`) &&
                _getSheet(clazz).clear();
            _setCache(clazz, []);
        };

        export const findBy = (clazz: RegisteredClass, prop: BoundInstanceProp, value: number | string) =>
            hydrate(clazz).find(o => (o as Record<BoundInstanceProp, any>)[prop] === value);

        export const hydrate = function<T extends ClassType>(clazz: RegisteredClass & T) {
            if(!_getCache(clazz)) {
                clazz.__hydrating = true;
                const values = _getSheet(clazz).getDataRange().getValues();
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

            return _getCache(clazz) as InstanceType<T>[];
        };

        export const register = function<T extends ClassType>(clazz: T, tableName: string, props: (null | BoundInstanceProp)[], hasHeaders?: boolean) {
            const boundClass = clazz as (RegisteredClass & T);
            boundClass.__firstRow = hasHeaders ? 2 : 1;
            boundClass.__tableName = tableName;

            props.forEach((prop, propIndex) => {
                if(!prop) {
                    return;
                }

                Object.defineProperty(clazz.prototype, prop, {
                    get: function(){ return this.__values[propIndex]; },
                    set: function(val){
                        if(boundClass.__hydrating){
                            return;
                        }

                        if (!this.__values){
                            hydrate(boundClass).push(this);

                            const newRow = props.map((_prop, i) => i === propIndex ? val : '');
                            GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.INSERT} ${tableName} - ${JSON.stringify(newRow)}`) &&
                                _getSheet(boundClass).appendRow(newRow.slice());
                            this.__values = newRow;
                        }else if(this.__values[propIndex] !== val){
                            const rowIndex = _getRowIndex(this);
                            GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.UPDATE} ${tableName}:${rowIndex} - ${prop}: ${this.__values[propIndex]} -> ${val}`) &&
                                _getSheet(boundClass).getRange(rowIndex, propIndex + 1).setValue(val);
                            this.__values[propIndex] = val;
                        }
                    }
                });
            });

            return boundClass;
        };

        export const remove = (o: BoundInstance) => {
            const clazz = _getClazz(o);
            GASton.checkProdMode(`${GASton.UPDATE_TYPES.DB.DELETE} ${clazz.__tableName}:${_getRowIndex(o)}`) &&
                _getSheet(clazz).deleteRow(_getRowIndex(o));
            JSUtil.ArrayUtil.remove(_getCache(clazz)!, o);
        };

        const _getCache = (clazz: RegisteredClass) => _cache[clazz.__tableName];
        const _getClazz = (o: BoundInstance) => o.constructor;

        const _getRowIndex = (o: BoundInstance) => {
            const clazz = _getClazz(o);
            return _getCache(clazz)!.indexOf(o) + clazz.__firstRow;
        };

        const _getSheet = (clazz: RegisteredClass) => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(clazz.__tableName)!;

        const _setCache = (clazz: RegisteredClass, objs: BoundInstance[]) => {
            _cache[clazz.__tableName] = objs;
        }
    }
}
