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
    return this.gameDays.toString();
};

PhysEd.SportMailingList.prototype.getGameDaysArray = function(){
    return this.getGameDays().split(',');
};

PhysEd.SportMailingList.__propsToCol = {
    guid: 1,
    sportGuid: 2,
    mailingListGuid: 3,
    earlyWarningEmail: 4,
    earlyWarningThreshold: 5,
    gameDays: 6,
    gameDayCount: 7,
    prePersistSides: 8
};
PhysEd.SportMailingList.__tableName = 'SPORT_MAILING_LIST';
