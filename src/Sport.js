PhysEd.Sport = function(name, isInPhysEdRotation, physEdCount, earlyWarningEmail, earlyWarningThreshold) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.name = name;
    this.isInPhysEdRotation = isInPhysEdRotation || 0;
    this.physEdCount = physEdCount || 0;
    this.earlyWarningEmail = earlyWarningEmail || '';
    this.earlyWarningThreshold = earlyWarningThreshold || 0;
};

PhysEd.Sport.__tableName = 'SPORT';
PhysEd.Sport.__propsToCol = {
    guid: 1,
    creationDate: 2,
    name: 3,
    isInPhysEdRotation: 4,
    physEdCount: 5,
    earlyWarningEmail: 6,
    earlyWarningThreshold: 7
};
