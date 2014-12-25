DateUtil = {
    addDays: function(days, date) {
        var date = new Date(date);
        date.setDate(date.getDate() + days);
        return date;
    },

    dayDiff: function(date1, date2) {
        return Math.floor((date2 - date1) / 86400000);
    },

    prettyDate: function(ts) {
        return (ts.getMonth()+1) + '/' + ts.getDate() + '/' + ts.getFullYear();
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
    }
};
