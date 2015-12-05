PhysEd.MailingList = function(email) {
    this.guid = JSUtil.GuidUtil.generate();
    this.email = email;
};

PhysEd.MailingList.__props = ['guid', 'email'];
PhysEd.MailingList.__tableName = 'MAILING_LIST';
