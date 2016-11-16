PhysEd.Team = function(gameGuid, score) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.gameGuid = gameGuid;
    this.score = score;
};

PhysEd.Team.__props = ['guid', 'creationDate', 'gameGuid', 'score'];
PhysEd.Team.__tableName = 'TEAM';
