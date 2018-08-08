PhysEd.MailingList = function(){};

PhysEd.MailingList.prototype.createFlowdock = function() {
    return this.flowdockApiToken && new PhysEd.Flowdock(this.flowdockApiToken, this.flowdockFlow);
};

GASton.Database.register(PhysEd.MailingList, 'MAILING_LIST', ['guid', 'email', 'flowdockFlow', 'flowdockApiToken', 'name', 'gameLocation', 'statsEmail']);
