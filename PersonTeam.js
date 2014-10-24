PersonTeam = function(personGuid, teamGuid) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.teamGuid = teamGuid;
};

PersonTeam.__tableName = 'PERSON_TEAM';
PersonTeam.__propsToCol = {
    guid: 1,
    creationDate: 2,
    personGuid: 3,
    teamGuid: 4
};