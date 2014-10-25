Sport = function(name, isInPhysEdRotation, physEdCount) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.name = name;
    this.isInPhysEdRotation = isInPhysEdRotation || 0;
    this.physEdCount = physEdCount || 0;
};

Sport.__tableName = 'SPORT';
Sport.__propsToCol = {
    guid: 1,
    creationDate: 2,
    name: 3,
    isInPhysEdRotation: 4,
    physEdCount: 5
};
