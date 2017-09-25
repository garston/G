GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    var physicalPhoneMessageInfos = [];
    this._getThreadMessagesToForward('from:' + GASton.Voice.TXT_DOMAIN + ' subject:' + GASton.Voice.TXT_SUBJECT).forEach(function(messages){
        var message = messages[0];
        var fromNumber = GASton.Voice.parseFromTxt(message).number;
        if(fromNumber === config.getPhysicalPhoneContact().number){
            this._txtContacts(messages, GASton.Voice.getTxt, function(errorMessage){
                physicalPhoneMessageInfos.push({ message: message, text: errorMessage });
            }, config);
        }else if(config.forwardToPhysicalPhone){
            physicalPhoneMessageInfos.push({
                message: message,
                text: [fromNumber].concat(messages.map(GASton.Voice.getTxt)).join(this.SEPARATOR)
            });
        }
    }, this);

    if(config.forwardToPhysicalPhone){
        this._getThreadMessagesToForward('from:' + GASton.Voice.NO_REPLY_EMAIL + ' subject:' + GASton.Voice.GROUP_TXT_SUBJECT).forEach(function(messages){
            physicalPhoneMessageInfos.push({
                message: messages[0],
                text: GASton.Voice.getFirstNumberMentioned(messages[0].getSubject()) + this.SEPARATOR + 'Group msg'
            });
        }, this);
    }

    physicalPhoneMessageInfos.forEach(function(info, index, infos){
        if(index){
            GASton.Mail.forward(info.message, 'Handled by batch: ' + infos[0].message.getSubject(), Session.getActiveUser().getEmail());
        }else{
            var text = physicalPhoneMessageInfos.map(function(info){ return info.text; }).join(this.SEPARATOR + this.SEPARATOR);
            this._sendTxt(info.message, GTxt.Compression.compress(text), config.getPhysicalPhoneContact(), config);
        }
    }, this);
};

GTxt.MonkeyInTheMiddle.sendTextsFromEmails = function(config) {
    var currentUserEmail = Session.getActiveUser().getEmail();
    this._getThreadMessagesToForward('from:' + currentUserEmail + ' subject:' + SpreadsheetApp.getActiveSpreadsheet().getName() + ' to:' + currentUserEmail).forEach(function(messages){
        this._txtContacts(
            messages,
            function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
            function(errorMessage){ GASton.Mail.forward(messages[0], errorMessage, currentUserEmail); },
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
                onContactNotFound.call(this, 'Cannot find contact with number ' + number);
            }
        }, this);
    }, this);
};
