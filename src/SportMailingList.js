PhysEd.SportMailingList = function(sportGuid, mailingListGuid, earlyWarningEmail, earlyWarningThreshold) {
    this.guid = JSUtil.GuidUtil.generate();
    this.sportGuid = sportGuid;
    this.mailingListGuid = mailingListGuid;
    this.earlyWarningEmail = earlyWarningEmail || '';
    this.earlyWarningThreshold = earlyWarningThreshold || 0;
};

PhysEd.SportMailingList.__propsToCol = {
    guid: 1,
    sportGuid: 2,
    mailingListGuid: 3,
    earlyWarningEmail: 4,
    earlyWarningThreshold: 5
};
PhysEd.SportMailingList.__tableName = 'SPORT_MAILING_LIST';
