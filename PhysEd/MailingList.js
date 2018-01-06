PhysEd.MailingList = function(){};

PhysEd.MailingList.prototype.createFlowdock = function() {
    return this.flowdockApiToken && new PhysEd.Flowdock(this.flowdockApiToken, this.flowdockFlow);
};

PhysEd.MailingList.__props = ['guid', 'email', 'flowdockFlow', 'flowdockApiToken', 'name', 'gameLocation', 'statsEmail'];
PhysEd.MailingList.__tableName = 'MAILING_LIST';
