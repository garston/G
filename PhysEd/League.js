PhysEd.League = function(){};

PhysEd.League.prototype.getGameDays = function(){
    return this.gameDays.toString().split(',').filter(function(day){ return day; }).map(function(day){ return parseInt(day); });
};

PhysEd.League.prototype.hasPredeterminedSchedule = function(){ return this.gameDayCount >= 0; };

PhysEd.League.__props = ['guid', 'sportName', 'mailingListGuid', 'earlyWarningMailingListGuid', 'earlyWarningThreshold', 'gameDays', 'gameDayCount', 'prePersistSides'];
PhysEd.League.__tableName = 'LEAGUE';
