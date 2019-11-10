JSUtil.StringUtil = {
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    contains: function(str, subStr){
        return str.indexOf(subStr) > -1;
    },

    matchSafe: function(str, re){
        return str.match(re) || [];
    },

    startsWith: function(str, subStr){
        return str.substring(0, subStr.length) === subStr;
    },

    stripTags: function(str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    }
};
