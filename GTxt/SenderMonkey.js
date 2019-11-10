GTxt.SenderMonkey = {};

GTxt.SenderMonkey.sendTextsFromEmails = function(config) {
    var currentUserEmail = Session.getActiveUser().getEmail();
    this.txtContacts(
        ['from:' + currentUserEmail, 'subject:' + SpreadsheetApp.getActiveSpreadsheet().getName(), 'to:' + currentUserEmail],
        null,
        function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
        function(){},
        function(errorMessage, message){ GASton.Mail.forward(message, errorMessage, currentUserEmail); },
        config
    );
};

GTxt.SenderMonkey.txtContacts = function(searchTerms, quickReplyContact, getMessageText, onSuccess, onError, config) {
    GTxt.Util.getInboxState(searchTerms).threadMessagesToForward.forEach(function(messages){
        messages.forEach(function(message){
            getMessageText(message).split(GTxt.DOUBLE_SEPARATOR).forEach(function(messageText){
                var messageParts = messageText.split(GTxt.SEPARATOR);
                var isQuickReply = messageParts.length === 1;
                var text = messageParts[isQuickReply ? 0 : 1];

                if(text){
                    this._findContacts(quickReplyContact, !isQuickReply && messageParts[0], onError, message, config).forEach(function(contact){
                        GASton.Mail.forward(message, GTxt.Compression.isCompressed(text) ? GTxt.Compression.decompress(text) : text, GTxt.Voice.getTxtEmail(contact, config));
                    });
                    onSuccess();
                } else {
                    onError('Couldn\'t parse txt sent at ' + message.getDate(), message);
                }
            }, this);
        }, this);
    }, this);
};

GTxt.SenderMonkey._findContacts = function(quickReplyContact, numberList, onError, message, config){
    if(numberList){
        return JSUtil.ArrayUtil.compact(numberList.split(',').map(function(numberStr){
            var numberMatch = JSUtil.StringUtil.matchSafe(numberStr, /(\d+)(!?)/);
            var number = +numberMatch[1];
            var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', number) || GTxt.Contact.findByNumber(number);
            if(!contact){
                onError('Cannot find ' + number, message);
            } else if (numberMatch[2]){
                GTxt.QuickReplyContactManager.set(contact, config);
            }
            return contact;
        }));
    }

    if (quickReplyContact){
        return [quickReplyContact];
    }

    onError('Quick reply n/a', message);
    return [];
};
