PhysEd.PersonTeam = function(personGuid, teamGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.teamGuid = teamGuid;
};

PhysEd.PersonTeam.__props = ['guid', 'creationDate', 'personGuid', 'teamGuid'];
PhysEd.PersonTeam.__tableName = 'PERSON_TEAM';
