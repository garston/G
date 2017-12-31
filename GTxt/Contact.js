GTxt.Contact = function(number, gvKey){
    this.guid = JSUtil.GuidUtil.generate();
    this.number = number;
    this.gvKey = gvKey;
    this.shortId = 0;
};

GTxt.Contact.allWithShortId = function(){
    return GASton.Database.hydrate(this).filter(function(c){ return c.shortId; });
};

GTxt.Contact.prototype.createShortId = function(){
    this.shortId = GTxt.Contact.allWithShortId().length + 1;
    GASton.Database.persist(this);
    return this.shortId;
};

GTxt.Contact.__props = ['guid', 'number', 'gvKey', 'shortId'];
GTxt.Contact.__tableName = 'CONTACTS';
