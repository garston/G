JSUtil.StringUtil = {
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    contains: function(str, subStr){
        return str.indexOf(subStr) > -1;
    }
};
