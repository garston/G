PhysEd.PhysEdNotifier = {};

PhysEd.PhysEdNotifier.notifyPhysEd = function(){
    var sport = this._determineSport();
    if(sport){
        PhysEd.InBasedThread.sendInitialEmails(sport);

        sport.gameDayCount += 1;
        GASton.Database.persist(PhysEd.Sport, sport);
    }
};

PhysEd.PhysEdNotifier._determineSport = function(){
    var tomorrowDay = (new Date().getDay() + 1) % 7;
    var sports = GASton.Database.hydrateAll(PhysEd.Sport).filter(function (sport) { return JSUtil.StringUtil.contains(sport.gameDays.toString(), tomorrowDay); });
    return sports.length && (sports.length === 1 ? sports[0] : this._findInProgressSport(sports) || this._findLowestSport(sports));
};

PhysEd.PhysEdNotifier._findInProgressSport = function(sports) {
    var timesPerSportBeforeSwitching = 2;
    return JSUtil.ArrayUtil.find(sports, function(sport){ return sport.gameDayCount % timesPerSportBeforeSwitching !== 0; });
};

PhysEd.PhysEdNotifier._findLowestSport = function(sports) {
    return sports.reduce(function(lowestSport, sport){ return sport.gameDayCount < lowestSport.gameDayCount ? sport : lowestSport; });
};
