PhysEd.SportMailingList = function(){};

PhysEd.SportMailingList.prototype.getGameDays = function(){
    return this.gameDays.toString().split(',').map(function(day){ return parseInt(day); });
};

PhysEd.SportMailingList.__props = ['guid', 'sportGuid', 'mailingListGuid', 'earlyWarningMailingListGuid', 'earlyWarningThreshold', 'gameDays', 'gameDayCount', 'prePersistSides'];
PhysEd.SportMailingList.__tableName = 'SPORT_MAILING_LIST';
