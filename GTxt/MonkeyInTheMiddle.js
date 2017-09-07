GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GmailApp.search('from:' + GASton.Voice.DOMAIN + ' in:inbox is:unread subject:' + GASton.Voice.TXT_SUBJECT).
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; }).
        forEach(function(messages){
            var fromNumber = GASton.Voice.parseFromTxt(messages[0]).number;
            if(fromNumber === config.getPhysicalPhoneContact().number){
                messages.forEach(function(message){ this._txtContacts(message, config); }, this);
            }else if(config.forwardToPhysicalPhone){
                this._txtPhysicalPhone(JSUtil.ArrayUtil.last(messages), [fromNumber].concat(messages.map(GASton.Voice.getTxt)).join(this.SEPARATOR), config);
            }
        }, this);
};

GTxt.MonkeyInTheMiddle._sendTxt = function(message, text, contact, config) {
    GASton.Voice.forwardTxt(message, text, config.gvNumber, contact.number, contact.gvKey);
};

GTxt.MonkeyInTheMiddle._txtContacts = function(message, config) {
    var messageParts = GASton.Voice.getTxt(message).split(this.SEPARATOR);
    messageParts[0].split(',').forEach(function(number){
        var contact = GASton.Database.findBy(GTxt.Contact, 'number', parseInt(number));
        if(contact){
            this._sendTxt(message, GTxt.Compression.decompress(messageParts[1]), contact, config);
        }else{
            this._txtPhysicalPhone(message, 'Cannot find contact with number ' + number, config);
        }
    }, this);
};

GTxt.MonkeyInTheMiddle._txtPhysicalPhone = function(message, text, config) {
    this._sendTxt(message, GTxt.Compression.compress(text), config.getPhysicalPhoneContact(), config);
};
