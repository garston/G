PhysEd.PersonTeam = function(personGuid, teamGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.teamGuid = teamGuid;
};

PhysEd.PersonTeam.__tableName = 'PERSON_TEAM';
PhysEd.PersonTeam.__propsToCol = {
    guid: 1,
    creationDate: 2,
    personGuid: 3,
    teamGuid: 4
};
