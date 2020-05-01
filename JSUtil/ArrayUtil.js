JSUtil.ArrayUtil = {
    average: function(a){ return a.length ? this.sum(a) / a.length : 0; },
    compact: function(a){ return a.filter(function(o){ return o; }); },

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

    last: function(a){ return a[a.length - 1]; },

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

    sum: function(a){ return a.reduce(function(sum, i){ return sum + i; }, 0); },
    times: function(n, fn, scope){ this.range(n).forEach(fn, scope); },

    unique: function(arr){
        return arr.reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
        }).reverse();
    }
};
