GTxt.Contact = function(number, gvKey){
    this.guid = JSUtil.GuidUtil.generate();
    this.number = number;
    this.gvKey = gvKey;
};
GTxt.Contact.__props = ['guid', 'number', 'gvKey'];
GTxt.Contact.__tableName = 'CONTACTS';
