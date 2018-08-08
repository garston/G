GTxt.Contact = function(number, gvKey){
    this.guid = JSUtil.GuidUtil.generate();
    this.number = number;
    this.gvKey = gvKey;
    this.shortId = 0;
};

GTxt.Contact.allWithShortId = function(){
    return GASton.Database.hydrate(this).filter(function(c){ return c.shortId; });
};

GTxt.Contact.findByNumber = function(number){ return GASton.Database.findBy(this, 'number', number); };

GTxt.Contact.prototype.createShortId = function(){
    this.shortId = GTxt.Contact.allWithShortId().length + 1;
    GASton.Database.persist(this);
    return this.shortId;
};

GASton.Database.register(GTxt.Contact, 'CONTACTS', ['guid', 'number', 'gvKey', 'shortId']);
