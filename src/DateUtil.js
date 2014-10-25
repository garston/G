DateUtil = {
    addDays: function (days, date){
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    },
    prettyDate: function (ts){
        return (ts.getMonth()+1) + '/' + ts.getDate() + '/' + ts.getFullYear();
    },
    splitPrettyDate: function(prettyDate){
        var parts = prettyDate.split('/');
        return {
            month: parts[0],
            day: parts[1],
            year: parts[2]
        };
    }
};
