ArrayUtil = {
    contains: function(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    },
    remove: function(a, o){
        var index = a.indexOf(o);
        if(index !== -1){
            a.splice(index, 1);
        }
    },
    unique: function(arr){
        return arr.reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
        }).reverse();
    }
};
