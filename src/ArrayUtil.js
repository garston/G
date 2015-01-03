ArrayUtil = {
    any: function(a, fn, scope) {
        return a.some(fn, scope);
    },

    compact: function(a) {
        var result = [];
        for(var i = 0; i < a.length; i++) {
            if(a[i]){
                result.push(a[i]);
            }
        }
        return result;
    },

    contains: function(a, obj) {
        return a.indexOf(obj) !== -1;
    },

    every: function(a, fn, scope) {
        return a.every(fn, scope);
    },

    filter: function(a, fn, scope) {
        return a.filter(fn, scope);
    },

    find: function(a, fn, scope) {
        for(var i = 0; i < a.length; i++) {
            if(fn.call(scope || a, a[i], i)) {
                return a[i];
            }
        }
        return null;
    },

    forEach: function(a, fn, scope) {
        a.forEach(fn, scope);
    },

    groupBy: function(a, fn, scope) {
        var groups = {};
        for (var i = 0; i < a.length; i++) {
            var group = fn.call(scope || a, a[i], i, a);
            if (group in groups) {
                groups[group].push(a[i]);
            } else {
                groups[group] = [a[i]];
            }
        }
        return groups;
    },

    map: function(a, fn, scope) {
        return a.map(fn, scope);
    },

    range: function(start, end, step) {
        start = +start || 0;
        step = typeof step == 'number' ? step : (+step || 1);
        if (end == null) {
            end = start;
            start = 0;
        }
        var index = -1,
            length = Math.max(0, Math.ceil((end - start) / (step || 1))),
            result = Array(length);
        while (++index < length) {
            result[index] = start;
            start += step;
        }
        return result;
    },

    reduce: function(a, fn, initialValue) {
        return arguments.length < 3 ? a.reduce(fn) : a.reduce(fn, initialValue);
    },

    remove: function(a, o){
        var index = a.indexOf(o);
        if(index !== -1){
            a.splice(index, 1);
        }
    },

    times: function(n, fn, scope) {
        ArrayUtil.forEach(ArrayUtil.range(n), fn, scope);
    },

    unique: function(arr){
        return arr.reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
        }).reverse();
    }
};
