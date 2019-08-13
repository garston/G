GTxt.QuickReplyContactManager = {};

GTxt.QuickReplyContactManager.compute = function(receivedTxtsInboxState, config){
    if(!config.forwardToPhysicalPhone){
        config.quickReplyContactGuid = '';
        return;
    }

    if(config.quickReplyContactGuid){
        return GASton.Database.findBy(GTxt.Contact, 'guid', config.quickReplyContactGuid);
    }

    var thread = receivedTxtsInboxState.allThreads[0];
    if(thread){
        var contact = GTxt.Contact.findByNumber(GTxt.Voice.parseFromTxt(thread.getMessages()[0]).number);
        this.set(contact, config);
        return contact;
    }
};

GTxt.QuickReplyContactManager.set = function(contact, config){ config.quickReplyContactGuid = contact.guid; }
