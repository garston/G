GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    this._getThreadMessagesToForward('from:' + GASton.Voice.DOMAIN + ' subject:' + GASton.Voice.TXT_SUBJECT).forEach(function(messages){
        var fromNumber = GASton.Voice.parseFromTxt(messages[0]).number;
        if(fromNumber === config.getPhysicalPhoneContact().number){
            this._txtContacts(messages, GASton.Voice.getTxt, function(message, errorMessage){
                this._txtPhysicalPhone(message, errorMessage, config);
            }, config);
        }else if(config.forwardToPhysicalPhone){
            this._txtPhysicalPhone(JSUtil.ArrayUtil.last(messages), [fromNumber].concat(messages.map(GASton.Voice.getTxt)).join(this.SEPARATOR), config);
        }
    }, this);

    var currentUserEmail = Session.getActiveUser().getEmail();
    this._getThreadMessagesToForward('from:' + currentUserEmail + ' subject:' + SpreadsheetApp.getActiveSpreadsheet().getName() + ' to:' + currentUserEmail).forEach(function(messages){
        this._txtContacts(
            messages,
            function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
            function(message, errorMessage){ GASton.Mail.forward(message, errorMessage, currentUserEmail); },
            config
        );
    }, this);
};

GTxt.MonkeyInTheMiddle._getThreadMessagesToForward = function(searchStr) {
    return GmailApp.search('in:inbox is:unread ' + searchStr).
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
};

GTxt.MonkeyInTheMiddle._sendTxt = function(message, text, contact, config) {
    GASton.Voice.forwardTxt(message, text, config.gvNumber, contact.number, contact.gvKey);
};

GTxt.MonkeyInTheMiddle._txtContacts = function (messages, getMessageText, onContactNotFound, config) {
    messages.forEach(function(message){
        var messageParts = getMessageText(message).split(this.SEPARATOR);
        messageParts[0].split(',').forEach(function(number){
            var contact = GASton.Database.findBy(GTxt.Contact, 'number', parseInt(number));
            if(contact){
                this._sendTxt(message, GTxt.Compression.decompress(messageParts[1]), contact, config);
            }else{
                onContactNotFound.call(this, message, 'Cannot find contact with number ' + number);
            }
        }, this);
    }, this);
};

GTxt.MonkeyInTheMiddle._txtPhysicalPhone = function(message, text, config) {
    this._sendTxt(message, GTxt.Compression.compress(text), config.getPhysicalPhoneContact(), config);
};
