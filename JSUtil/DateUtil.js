JSUtil.DateUtil = {
    addDays: function(days, date) {
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    },

    dayOfWeekString: function(dayOfWeek) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    },

    diff: function(date1, date2) {
        return Math.floor((date2 - date1) / 86400000);
    },

    getDay: daysFromNow => (new Date().getDay() + daysFromNow) % 7,

    lastDayOfMonth: function(date) {
        var newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear(), newDate.getMonth() + 1, 0)
        return newDate;
    },

    startOfDay: function(date) {
        var newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    },

    timeString: d => `${d.getHours()}:${d.getMinutes() < 10 ? 0 : ''}${d.getMinutes()}`,

    toPrettyString: function(date, omitYear) {
        return (date.getMonth()+1) + '/' + date.getDate() + (omitYear ? '' : '/' + date.getFullYear());
    }
};
