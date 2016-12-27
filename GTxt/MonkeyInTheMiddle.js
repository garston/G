GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.GV_TXT_DOMAIN = 'txt.voice.google.com';
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GmailApp.search('from:' + this.GV_TXT_DOMAIN + ' in:inbox is:unread subject:SMS').
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; }).
        forEach(function(messages){
            var fromNumber = GASton.Mail.parseFrom(messages[0]).email.match(/^\d+\.1(\d+)/)[1];
            var messageBodies = messages.map(function(message){ return GASton.Mail.getMessageWords(message).join(' '); });

            if(fromNumber === config.getPhysicalPhoneContact().number.toString()){
                messages.forEach(function(message, index){ this._txtContact(message, messageBodies[index], config); }, this);
            }else{
                this._sendTxt(JSUtil.ArrayUtil.last(messages), [fromNumber].concat(messageBodies).join(this.SEPARATOR), config.getPhysicalPhoneContact(), config);
            }
        }, this);
};

GTxt.MonkeyInTheMiddle._sendTxt = function(message, body, contact, config) {
    GASton.Mail.forward(message, body, '1' + config.gvNumber + '.1' + contact.number + '.' + contact.gvKey + '@' + this.GV_TXT_DOMAIN);
};

GTxt.MonkeyInTheMiddle._txtContact = function(message, messageBody, config) {
    var messageParts = messageBody.split(this.SEPARATOR);
    var contact = GASton.Database.findBy(GTxt.Contact, 'number', parseInt(messageParts[0]));
    if(contact){
        this._sendTxt(message, messageParts[1], contact, config);
    }else{
        this._sendTxt(message, 'Cannot find contact with number ' + messageParts[0], config.getPhysicalPhoneContact(), config);
    }
};
