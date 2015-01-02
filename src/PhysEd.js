PhysEd = function(){};

PhysEd.TIMES_PER_SPORT_BEFORE_SWITCHING = 2;

PhysEd.prototype.notifyPhysEd = function(){
    var sport = this._determinePhysEdSport();
    InBasedThread.sendInitialEmail(sport.name, 'Tomorrow', CONST.PHYS_ED_EMAIL);

    sport.physEdCount += 1;
    Database.persist(Sport, sport);
};

PhysEd.prototype._determinePhysEdSport = function(){
    var physEdSports = Database.hydrateAllBy(Sport, ['isInPhysEdRotation', 1]);
    return this._findInProgressSport(physEdSports) || this._findLowestSport(physEdSports);
};

PhysEd.prototype._findInProgressSport = function(physEdSports) {
    return ArrayUtil.find(physEdSports, function(sport){
        return sport.physEdCount % PhysEd.TIMES_PER_SPORT_BEFORE_SWITCHING !== 0;
    });
};

PhysEd.prototype._findLowestSport = function(physEdSports) {
    return ArrayUtil.reduce(physEdSports, function(lowestSport, sport){
        return sport.physEdCount < lowestSport.physEdCount ? sport : lowestSport;
    });
};
