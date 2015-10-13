PhysEd.Sport = function(name, gameDays, prePersistSides, gameDayCount) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.name = name;
    this.gameDays = gameDays || '';
    this.prePersistSides = prePersistSides || 0;
    this.gameDayCount = gameDayCount || 0;
};

PhysEd.Sport.hydrateByName = function(name) {
    return GASton.Database.hydrateBy(PhysEd.Sport, ['name', name]) || new PhysEd.Sport(name);
};

PhysEd.Sport.__tableName = 'SPORT';
PhysEd.Sport.__propsToCol = {
    guid: 1,
    creationDate: 2,
    name: 3,
    gameDays: 4,
    prePersistSides: 5,
    gameDayCount: 6
};
