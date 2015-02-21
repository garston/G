PhysEd.Person = function(email, firstName, lastName) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.email = email;
    this.firstName = firstName || '';
    this.lastName = lastName || '';
};

PhysEd.Person.prototype.getDisplayString = function(){
    return this.firstName && this.lastName ? this.firstName + ' ' + this.lastName : this.email;
};

PhysEd.Person.prototype.getPersonSport = function(sport){
    return Database.hydrateBy(PhysEd.PersonSport, ['personGuid', this.guid, 'sportGuid', sport.guid]) || new PhysEd.PersonSport(this.guid, sport.guid)
};

PhysEd.Person.__tableName = 'PERSON';
PhysEd.Person.__propsToCol = {
    guid: 1,
    creationDate: 2,
    email: 3,
    firstName: 4,
    lastName: 5
};
