GASton.Util = {};
GASton.Util.getClassMetadataValue = function(clazz, fieldName) { return typeof(clazz[fieldName]) === 'function' ? clazz[fieldName].call(clazz) : clazz[fieldName]; };
