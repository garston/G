PhysEd.SportMailingList = function(sportGuid, mailingListGuid, earlyWarningEmail, earlyWarningThreshold, gameDays, gameDayCount, prePersistSides) {
    this.guid = JSUtil.GuidUtil.generate();
    this.sportGuid = sportGuid;
    this.mailingListGuid = mailingListGuid;
    this.earlyWarningEmail = earlyWarningEmail || '';
    this.earlyWarningThreshold = earlyWarningThreshold || 0;
    this.gameDays = gameDays || '';
    this.gameDayCount = gameDayCount || 0;
    this.prePersistSides = prePersistSides || 0;
};

PhysEd.SportMailingList.prototype.getGameDays = function(){
    return this.gameDays.toString().split(',').map(function(day){ return parseInt(day); });
};

PhysEd.SportMailingList.__props = ['guid', 'sportGuid', 'mailingListGuid','earlyWarningEmail', 'earlyWarningThreshold', 'gameDays', 'gameDayCount', 'prePersistSides'];
PhysEd.SportMailingList.__tableName = 'SPORT_MAILING_LIST';
