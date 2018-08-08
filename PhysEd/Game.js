PhysEd.Game = function(month, day, year, leagueGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.month = month;
    this.day = day;
    this.year = year;
    this.leagueGuid = leagueGuid;
};

GASton.Database.register(PhysEd.Game, 'GAME', ['guid', 'creationDate', 'month', 'day', 'year', 'leagueGuid']);
