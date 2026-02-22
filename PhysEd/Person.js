PhysEd.Person = class {
    constructor(email, firstName, lastName) {
        this.guid = JSUtil.GuidUtil.generate();
        this.creationDate = new Date();
        this.email = email;
        this.firstName = firstName || '';
        this.lastName = lastName || '';
    }

    getDisplayString() {
        return this.firstName && this.lastName ? this.firstName + ' ' + this.lastName : this.email;
    }
};

GASton.Database.register(PhysEd.Person, 'PERSON', ['guid', 'creationDate', 'email', 'firstName', 'lastName', 'alternateNames']);
