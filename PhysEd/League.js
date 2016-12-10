PhysEd.League = function(){};

PhysEd.League.prototype.getGameDays = function(){
    return this.gameDays.toString().split(',').map(function(day){ return parseInt(day); });
};

PhysEd.League.prototype.hasPredeterminedSchedule = function(){ return this.gameDayCount >= 0; };

PhysEd.League.__props = ['guid', 'sportGuid', 'mailingListGuid', 'earlyWarningMailingListGuid', 'earlyWarningThreshold', 'gameDays', 'gameDayCount', 'prePersistSides'];
PhysEd.League.__tableName = 'LEAGUE';
