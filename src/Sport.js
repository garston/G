PhysEd.Sport = function(name) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.name = name;
};

PhysEd.Sport.hydrateByName = function(name) {
    return JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Sport), function(sport){ return sport.name === name; }) || new PhysEd.Sport(name);
};

PhysEd.Sport.__props = ['guid', 'creationDate', 'name'];
PhysEd.Sport.__tableName = 'SPORT';
