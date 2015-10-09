PhysEd.MailingList = function(email) {
    this.guid = JSUtil.GuidUtil.generate();
    this.email = email;
};

PhysEd.MailingList.__propsToCol = {
    guid: 1,
    email: 2
};
PhysEd.MailingList.__tableName = 'MAILING_LIST';
