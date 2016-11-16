GASton.DatabaseCache = {};
GASton.DatabaseCache._cache = {};

GASton.DatabaseCache.get = function(clazz) { return this._cache[this._getCacheKey(clazz)]; };
GASton.DatabaseCache.remove = function(clazz, o) { JSUtil.ArrayUtil.remove(this.get(clazz), o); };
GASton.DatabaseCache.set = function(clazz, objs) { this._cache[this._getCacheKey(clazz)] = objs; };
GASton.DatabaseCache._getCacheKey = function(clazz){ return GASton.Util.getClassMetadataValue(clazz, '__tableName'); };
