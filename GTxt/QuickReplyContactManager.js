GTxt.QuickReplyContactManager = {};

GTxt.QuickReplyContactManager.compute = function(txtInboxState, config){
    if(!config.forwardToPhysicalPhone){
        config.quickReplyContactGuid = '';
        return;
    }

    if(config.quickReplyContactGuid){
        return GASton.Database.findBy(GTxt.Contact, 'guid', config.quickReplyContactGuid);
    }

    var number = JSUtil.ArrayUtil.find(
        txtInboxState.allThreads.map(function(thread){ return GTxt.Voice.parseFromTxt(thread.getMessages()[0]).number; }),
        function(from){ return from !== config.getPhysicalPhoneContact().number; }
    );
    if(number){
        var contact = GTxt.Contact.findByNumber(number);
        this.set(contact, config);
        return contact;
    }
};

GTxt.QuickReplyContactManager.set = function(contact, config){ config.quickReplyContactGuid = contact.guid; }
