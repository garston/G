PhysEd.MailingList = function(){};

PhysEd.MailingList.createGroupMePollTmrwParams = () => {
    const tmrw = JSUtil.DateUtil.addDays(1, new Date());
    return {
        expiration: Math.ceil(tmrw.getTime()/1000),
        subject: tmrw.toLocaleString('en-us', {weekday: 'long'})
    };
};

PhysEd.MailingList.prototype.createFlowdock = function() {
    return this.flowdockApiToken && new PhysEd.Flowdock(this.flowdockApiToken, this.flowdockFlow);
};

PhysEd.MailingList.prototype.createGroupMePoll = function(league) {
    if(!this.groupMeApiToken) {
        return;
    }

    GASton.Url.post(`https://api.groupme.com/v3/poll/${this.groupMeGroupId}?token=${this.groupMeApiToken}`, {
        contentType: 'application/json',
        payload: JSON.stringify({
            ...PhysEd.MailingList.createGroupMePollTmrwParams(),
            options: league.playerStatusOptions.split(',').map(o => ({title: o})),
            type: 'single',
            visibility: 'public'
        })
    });
};

GASton.Database.register(PhysEd.MailingList, 'MAILING_LIST', ['guid', 'email', 'flowdockApiToken', 'flowdockFlow', 'groupMeApiToken', 'groupMeGroupId', 'name', 'gameLocation', 'statsEmail']);
