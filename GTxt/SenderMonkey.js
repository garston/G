GTxt.SenderMonkey = {};

GTxt.SenderMonkey.sendTextsFromEmails = function(config) {
    this.txtContacts(
        ['from:me', 'subject:' + SpreadsheetApp.getActiveSpreadsheet().getName()],
        GASton.Mail.getMessageText,
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

                if(messageParts.length > 2 || !text){
                    onError(`Can't parse txt sent @ ${message.getDate()}`, message);
                } else {
                    this._findContacts(!isQuickReply && messageParts[0], onError, message, config).forEach(function(contact){
                        GTxt.Util.mail(
                            GTxt.Voice.getTxtEmail(contact, config),
                            GTxt.Compression.isCompressed(text) ? GTxt.Compression.decompress(text) : text,
                            [message]
                        );
                        onSuccess(contact);
                    });
                }
            }, this);
        }, this);
    }, this);
};

GTxt.SenderMonkey._findContacts = function(numberList, onError, message, config){
    if(numberList){
        return JSUtil.ArrayUtil.compact(numberList.split(',').map(function(numberStr){
            const cleanedNumberStr = numberStr.replace(/[+ ()]/g, '').replace(/(\d)-/g, '$1').replace(/^1(\d{10})$/, '$1');
            const numberMatch = JSUtil.StringUtil.matchSafe(cleanedNumberStr, /^(-?)(\d+)(!?)$/);
            const number = +`${numberMatch[1]}${numberMatch[2]}`;
            var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', number) || GTxt.Contact.findByNumber(number);
            if(!contact){
                onError(`Can't find #${numberStr}# -> ${number}`, message);
            } else if (numberMatch[3]){
                config.setQuickReplyContact(contact, true);
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
