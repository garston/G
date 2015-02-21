PhysEd.PhysEdNotifier = function(){};

PhysEd.PhysEdNotifier.TIMES_PER_SPORT_BEFORE_SWITCHING = 2;

PhysEd.PhysEdNotifier.prototype.notifyPhysEd = function(){
    var sport = this._determinePhysEdSport();
    PhysEd.InBasedThread.sendInitialEmail(sport.name, 'Tomorrow', PhysEd.Const.PHYS_ED_EMAIL);

    sport.physEdCount += 1;
    Database.persist(PhysEd.Sport, sport);
};

PhysEd.PhysEdNotifier.prototype._determinePhysEdSport = function(){
    var physEdSports = Database.hydrateAllBy(PhysEd.Sport, ['isInPhysEdRotation', 1]);
    return this._findInProgressSport(physEdSports) || this._findLowestSport(physEdSports);
};

PhysEd.PhysEdNotifier.prototype._findInProgressSport = function(physEdSports) {
    return ArrayUtil.find(physEdSports, function(sport){
        return sport.physEdCount % PhysEd.PhysEdNotifier.TIMES_PER_SPORT_BEFORE_SWITCHING !== 0;
    });
};

PhysEd.PhysEdNotifier.prototype._findLowestSport = function(physEdSports) {
    return ArrayUtil.reduce(physEdSports, function(lowestSport, sport){
        return sport.physEdCount < lowestSport.physEdCount ? sport : lowestSport;
    });
};
