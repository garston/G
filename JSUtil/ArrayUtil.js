JSUtil.ArrayUtil = {
    average: function(a) {
        return a.length ? this.sum(a) / a.length : 0;
    },

    compact: function(a) {
        return a.filter(function(o){ return o; });
    },

    contains: function(a, obj) {
        return a.indexOf(obj) !== -1;
    },

    find: function(a, fn, scope) {
        for(var i = 0; i < a.length; i++) {
            if(fn.call(scope || a, a[i], i)) {
                return a[i];
            }
        }
        return null;
    },

    flatten: function(array) {
        var worker = [];

        function rFlatten(a) {
            var i, ln, v;

            for (i = 0, ln = a.length; i < ln; i++) {
                v = a[i];

                if (Array.isArray(v)) {
                    rFlatten(v);
                } else {
                    worker.push(v);
                }
            }

            return worker;
        }

        return rFlatten(array);
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

    remove: function(a, o){
        var index = a.indexOf(o);
        if(index !== -1){
            a.splice(index, 1);
        }
    },

    sum: function(a){
        return a.reduce(function(sum, i){ return sum + i; }, 0);
    },

    times: function(n, fn, scope) {
        this.range(n).forEach(fn, scope);
    },

    unique: function(arr){
        return arr.reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
        }).reverse();
    }
};
