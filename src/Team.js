PhysEd.Team = function(gameGuid, score) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.gameGuid = gameGuid;
    this.score = score;
};

PhysEd.Team.__tableName = 'TEAM';
PhysEd.Team.__propsToCol = {
    guid: 1,
    creationDate: 2,
    gameGuid: 3,
    score: 4
};
