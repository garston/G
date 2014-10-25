Person = function(email, firstName, lastName) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.email = email;
    this.firstName = firstName || '';
    this.lastName = lastName || '';
};

Person.prototype.getDisplayString = function(){
    return this.firstName && this.lastName ? this.firstName + ' ' + this.lastName : this.email;
};

Person.prototype.getPersonSport = function(sport){
    return Database.hydrateBy(PersonSport, ['personGuid', this.guid, 'sportGuid', sport.guid]) || new PersonSport(this.guid, sport.guid)
};

Person.__tableName = 'PERSON';
Person.__propsToCol = {
    guid: 1,
    creationDate: 2,
    email: 3,
    firstName: 4,
    lastName: 5
};
