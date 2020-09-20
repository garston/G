GTxt.Contact = function(number, gvKey){
    this.guid = JSUtil.GuidUtil.generate();
    this.number = number;
    this.gvKey = gvKey;
    this.shortId = 0;
};

GTxt.Contact.findByNumber = function(number){ return GASton.Database.findBy(this, 'number', number); };

GTxt.Contact.prototype.createShortId = function(){
    return this.shortId = GASton.Database.hydrate(GTxt.Contact).filter(c => c.hasShortId()).length + 1;
};

GTxt.Contact.prototype.hasShortId = function(){ return this.shortId > 0; };

GASton.Database.register(GTxt.Contact, 'CONTACTS', ['guid', 'number', 'gvKey', 'shortId']);
