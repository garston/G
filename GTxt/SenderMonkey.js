GTxt.SenderMonkey = {};

GTxt.SenderMonkey.sendTextsFromEmails = function(config) {
    var currentUserEmail = Session.getActiveUser().getEmail();
    GTxt.Util.getInboxState('from:' + currentUserEmail + ' subject:' + SpreadsheetApp.getActiveSpreadsheet().getName() + ' to:' + currentUserEmail).threadMessagesToForward.forEach(function(messages){
        this.txtContacts(
            messages, null,
            function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
            function(errorMessage){ GASton.Mail.forward(messages[0], errorMessage, currentUserEmail); },
            config
        );
    }, this);
};

GTxt.SenderMonkey.txtContacts = function(messages, quickReplyContact, getMessageText, onError, config) {
    messages.forEach(function(message){
        getMessageText(message).split(GTxt.DOUBLE_SEPARATOR).forEach(function(messageText){
            var messageParts = messageText.split(GTxt.SEPARATOR);
            var isQuickReply = messageParts.length === 1;
            var text = messageParts[isQuickReply ? 0 : 1];

            if(text){
                this._findContacts(quickReplyContact, !isQuickReply && messageParts[0], onError, config).forEach(function(contact){
                    GASton.Mail.forward(message, GTxt.Compression.isCompressed(text) ? GTxt.Compression.decompress(text) : text, GTxt.Voice.getTxtEmail(contact, config));
                });
            } else {
                onError('Couldn\'t parse txt sent at ' + message.getDate());
            }
        }, this);
    }, this);
};

GTxt.SenderMonkey._findContacts = function(quickReplyContact, numberList, onError, config){
    if(numberList){
        return JSUtil.ArrayUtil.compact(numberList.split(',').map(function(numberStr){
            var numberMatch = numberStr.match(/(\d+)(!?)/);
            var number = +numberMatch[1];
            var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', number) || GTxt.Contact.findByNumber(number);
            if(!contact){
                onError('Cannot find ' + number);
            } else if (numberMatch[2]){
                GTxt.QuickReplyContactManager.set(contact, config);
            }
            return contact;
        }));
    }

    if (quickReplyContact){
        return [quickReplyContact];
    }

    onError('Quick reply n/a');
    return [];
};
