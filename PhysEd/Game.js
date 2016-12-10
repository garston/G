PhysEd.Game = function(month, day, year, leagueGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.month = month;
    this.day = day;
    this.year = year;
    this.leagueGuid = leagueGuid;
};

PhysEd.Game.__props = ['guid', 'creationDate', 'month', 'day', 'year', 'leagueGuid'];
PhysEd.Game.__tableName = 'GAME';
