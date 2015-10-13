PhysEd.PhysEdNotifier = {};

PhysEd.PhysEdNotifier.notifyPhysEd = function(){
    var sport = this._determinePhysEdSport();
    PhysEd.InBasedThread.sendInitialEmails(sport.name, 'Tomorrow');

    sport.physEdCount += 1;
    GASton.Database.persist(PhysEd.Sport, sport);
};

PhysEd.PhysEdNotifier._determinePhysEdSport = function(){
    var physEdSports = GASton.Database.hydrateAllBy(PhysEd.Sport, ['isInPhysEdRotation', 1]);
    return this._findInProgressSport(physEdSports) || this._findLowestSport(physEdSports);
};

PhysEd.PhysEdNotifier._findInProgressSport = function(physEdSports) {
    var timesPerSportBeforeSwitching = 2;
    return JSUtil.ArrayUtil.find(physEdSports, function(sport){
        return sport.physEdCount % timesPerSportBeforeSwitching !== 0;
    });
};

PhysEd.PhysEdNotifier._findLowestSport = function(physEdSports) {
    return physEdSports.reduce(function(lowestSport, sport){
        return sport.physEdCount < lowestSport.physEdCount ? sport : lowestSport;
    });
};
