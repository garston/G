Team = function(gameGuid, score) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.gameGuid = gameGuid;
    this.score = score;
};

Team.__tableName = 'TEAM';
Team.__propsToCol = {
    guid: 1,
    creationDate: 2,
    gameGuid: 3,
    score: 4
};
