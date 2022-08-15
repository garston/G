JSUtil.StringUtil = {
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // https://stackoverflow.com/a/57448862
    escapeHTML: str => str.replace(/[&<>'"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[c])),

    matchSafe: function(str, re){
        return str.match(re) || [];
    },

    stripTags: function(str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    }
};
