JSUtil.StringUtil = {
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    escapeHTML: str => str.replace(/</g, '&lt;').replace(/>/g, '&gt;'),

    matchSafe: function(str, re){
        return str.match(re) || [];
    },

    splitPossiblyEmpty: str => str ? str.split(',') : [],

    stripTags: function(str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    }
};
