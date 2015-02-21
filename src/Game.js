PhysEd.Game = function(month, day, year, sportGuid) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.month = month;
    this.day = day;
    this.year = year;
    this.sportGuid = sportGuid;
};

PhysEd.Game.__tableName = 'GAME';
PhysEd.Game.__propsToCol = {
    guid: 1,
    creationDate: 2,
    month: 3,
    day: 4,
    year: 5,
    sportGuid: 6
};
