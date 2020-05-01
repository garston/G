JSUtil.StringUtil = {
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    matchSafe: function(str, re){
        return str.match(re) || [];
    },

    stripTags: function(str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    }
};
