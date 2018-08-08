PhysEd.PersonTeam = function(personGuid, teamGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.teamGuid = teamGuid;
};

GASton.Database.register(PhysEd.PersonTeam, 'PERSON_TEAM', ['guid', 'creationDate', 'personGuid', 'teamGuid']);
