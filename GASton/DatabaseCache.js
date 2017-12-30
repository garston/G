GASton.DatabaseCache = {};
GASton.DatabaseCache._cache = {};

GASton.DatabaseCache.get = function (clazz) { return this._cache[clazz.__tableName]; };
GASton.DatabaseCache.remove = function(clazz, o) { JSUtil.ArrayUtil.remove(this.get(clazz), o); };
GASton.DatabaseCache.set = function (clazz, objs) { this._cache[clazz.__tableName] = objs; };
