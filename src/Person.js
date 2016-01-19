PhysEd.Person = function(email, firstName, lastName, alternateNames) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.email = email;
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.alternateNames = alternateNames || '';
};

PhysEd.Person.prototype.getAlternateNames = function(){
    return this.alternateNames ? this.alternateNames.split(',') : [];
};

PhysEd.Person.prototype.getDisplayString = function(){
    return this.firstName && this.lastName ? this.firstName + ' ' + this.lastName : this.email;
};

PhysEd.Person.__props = ['guid', 'creationDate', 'email', 'firstName', 'lastName', 'alternateNames'];
PhysEd.Person.__tableName = 'PERSON';
