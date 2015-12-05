PhysEd.Game = function(month, day, year, sportGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.month = month;
    this.day = day;
    this.year = year;
    this.sportGuid = sportGuid;
};

PhysEd.Game.__props = ['guid', 'creationDate', 'month', 'day', 'year', 'sportGuid'];
PhysEd.Game.__tableName = 'GAME';
