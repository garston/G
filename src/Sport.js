PhysEd.Sport = function(name) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.name = name;
};

PhysEd.Sport.hydrateByName = function(name) {
    return GASton.Database.hydrateBy(PhysEd.Sport, ['name', name]) || new PhysEd.Sport(name);
};

PhysEd.Sport.__tableName = 'SPORT';
PhysEd.Sport.__propsToCol = {
    guid: 1,
    creationDate: 2,
    name: 3
};
