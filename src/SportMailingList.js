PhysEd.SportMailingList = function(sportGuid, mailingListGuid, earlyWarningMailingListGuid, earlyWarningThreshold, gameDays, gameDayCount, prePersistSides) {
    this.guid = JSUtil.GuidUtil.generate();
    this.sportGuid = sportGuid;
    this.mailingListGuid = mailingListGuid;
    this.earlyWarningMailingListGuid = earlyWarningMailingListGuid;
    this.earlyWarningThreshold = earlyWarningThreshold;
    this.gameDays = gameDays;
    this.gameDayCount = gameDayCount;
    this.prePersistSides = prePersistSides;
};

PhysEd.SportMailingList.prototype.getGameDays = function(){
    return this.gameDays.toString().split(',').map(function(day){ return parseInt(day); });
};

PhysEd.SportMailingList.__props = ['guid', 'sportGuid', 'mailingListGuid', 'earlyWarningMailingListGuid', 'earlyWarningThreshold', 'gameDays', 'gameDayCount', 'prePersistSides'];
PhysEd.SportMailingList.__tableName = 'SPORT_MAILING_LIST';
