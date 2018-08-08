PhysEd.Team = function(gameGuid, score) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.gameGuid = gameGuid;
    this.score = score;
};

GASton.Database.register(PhysEd.Team, 'TEAM', ['guid', 'creationDate', 'gameGuid', 'score']);
