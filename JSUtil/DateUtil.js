JSUtil.DateUtil = {
    addDays: function(days, date) {
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    },

    dayDiff: function(date1, date2) {
        return Math.floor((date2 - date1) / 86400000);
    },

    dayOfWeekString: function(dayOfWeek) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    },

    lastDayOfMonth: function(date) {
        var newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear(), newDate.getMonth() + 1, 0)
        return newDate;
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
        var newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    },

    toPrettyString: function(date) {
        return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
    },

    toSearchString: function(date) {
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    }
};
