JSUtil.DateUtil = {
    addDays: function(days, date) {
        var date = new Date(date);
        date.setDate(date.getDate() + days);
        return date;
    },

    dayDiff: function(date1, date2) {
        return Math.floor((date2 - date1) / 86400000);
    },

    splitPrettyDate: function(prettyDate){
        var parts = prettyDate.split('/');
        return {
            month: parts[0],
            day: parts[1],
            year: parts[2]
        };
    },

    startOfDay: function(date) {
        var date = new Date(date);
        date.setHours(0, 0, 0, 0);
        return date;
    },

    toPrettyString: function(date) {
        return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
    },

    toSearchString: function(date) {
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    }
};
