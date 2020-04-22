GTxt.SenderMonkey = {};

GTxt.SenderMonkey.sendTextsFromEmails = function(config) {
    this.txtContacts(
        ['from:me', 'subject:' + SpreadsheetApp.getActiveSpreadsheet().getName()],
        function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
        function(){},
        function(errorMessage, message){ GTxt.Util.mail(Session.getActiveUser().getEmail(), errorMessage, [message]); },
        config
    );
};

GTxt.SenderMonkey.txtContacts = function(searchTerms, getMessageText, onSuccess, onError, config) {
    GTxt.Util.getThreadMessagesToForward(searchTerms).forEach(function(messages){
        messages.forEach(function(message){
            getMessageText(message).split(GTxt.DOUBLE_SEPARATOR).forEach(function(messageText){
                var messageParts = messageText.split(GTxt.SEPARATOR);
                var isQuickReply = messageParts.length === 1;
                var text = messageParts[isQuickReply ? 0 : 1];

                if(text){
                    this._findContacts(!isQuickReply && messageParts[0], onError, message, config).forEach(function(contact){
                        GTxt.Util.mail(
                            GTxt.Voice.getTxtEmail(contact, config),
                            GTxt.Compression.isCompressed(text) ? GTxt.Compression.decompress(text) : text,
                            [message]
                        );
                    });
                    onSuccess();
                } else {
                    onError('Couldn\'t parse txt sent at ' + message.getDate(), message);
                }
            }, this);
        }, this);
    }, this);
};

GTxt.SenderMonkey._findContacts = function(numberList, onError, message, config){
    if(numberList){
        return JSUtil.ArrayUtil.compact(numberList.split(',').map(function(numberStr){
            var numberMatch = JSUtil.StringUtil.matchSafe(numberStr, /(\d+)(!?)/);
            var number = +numberMatch[1];
            var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', number) || GTxt.Contact.findByNumber(number);
            if(!contact){
                onError('Cannot find ' + number, message);
            } else if (numberMatch[2]){
                config.quickReplyContactGuid = contact.guid;
            }
            return contact;
        }));
    }

    var quickReplyContact = config.getQuickReplyContact();
    if (quickReplyContact){
        return [quickReplyContact];
    }

    onError('Quick reply n/a', message);
    return [];
};
