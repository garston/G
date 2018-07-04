GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';
GTxt.MonkeyInTheMiddle.DOUBLE_SEPARATOR = '||';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    var physicalPhoneMessageObjs = this._processTxtEmails(
        'from:' + GTxt.Voice.TXT_DOMAIN + ' subject:' + GTxt.Voice.TXT_SUBJECT,
        function(message){ return GTxt.Voice.parseFromTxt(message).number; },
        function(message){ return GTxt.Voice.getTxt(message); },
        config,
        GTxt.Voice.isNotMarketing
    ).concat(this._processTxtEmails(
        'from:' + GTxt.Voice.NO_REPLY_EMAIL + ' subject:' + GTxt.Voice.GROUP_TXT_SUBJECT,
        function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getSubject()); },
        function(){ return 'GM'; },
        config
    )).concat(this._processTxtEmails(
        'from:' + GTxt.Voice.NO_REPLY_EMAIL + ' subject:' + GTxt.Voice.VOICEMAIL_SUBJECT,
        function(message){ return GTxt.Voice.getVoicemailFrom(message); },
        function(message){ return 'VM: ' + GTxt.Voice.getVoicemailText(message); },
        config
    ));

    var primaryMessageObj = JSUtil.ArrayUtil.find(physicalPhoneMessageObjs, function(obj){ return obj.plainMessage; });
    if(primaryMessageObj){
        physicalPhoneMessageObjs.forEach(function(obj){
            if(obj === primaryMessageObj){
                var text = physicalPhoneMessageObjs.map(function(obj){ return obj.text; }).join(this.DOUBLE_SEPARATOR);
                var compressedText = GTxt.Compression.compress(text);
                this._sendTxt(obj.message, this._numTexts(compressedText) < this._numTexts(text) ? compressedText : text, config.getPhysicalPhoneContact(), config);
            }else{
                GASton.Mail.forward(obj.message, 'Handled by batch: ' + primaryMessageObj.message.getSubject(), Session.getActiveUser().getEmail());
            }
        }, this);
    }
};

GTxt.MonkeyInTheMiddle.sendTextsFromEmails = function(config) {
    var currentUserEmail = Session.getActiveUser().getEmail();
    this._getInboxState('from:' + currentUserEmail + ' subject:' + SpreadsheetApp.getActiveSpreadsheet().getName() + ' to:' + currentUserEmail).threadMessagesToForward.forEach(function(messages){
        this._txtContacts(
            messages, [],
            function(message){ return GASton.Mail.getMessageWords(message).join(' '); },
            function(errorMessage){ GASton.Mail.forward(messages[0], errorMessage, currentUserEmail); },
            config
        );
    }, this);
};

GTxt.MonkeyInTheMiddle._findContacts = function(quickReplyContacts, numberList, onError){
    if(numberList){
        return JSUtil.ArrayUtil.compact(numberList.split(',').map(function(number){
            var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', +number) || GTxt.Contact.findByNumber(+number);
            if(!contact){
                onError('Cannot find ' + number);
            }
            return contact;
        }));
    }

    if (quickReplyContacts.length === 1){
        return quickReplyContacts;
    }

    onError('Quick reply n/a: ' + quickReplyContacts.map(function(c){ return c.number; }));
    return [];
};

GTxt.MonkeyInTheMiddle._getInboxState = function(searchStr) {
    var allThreads = GmailApp.search('in:inbox is:unread ' + searchStr);
    var threadMessagesToForward = allThreads.
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByScript(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
    return { allThreads: allThreads, threadMessagesToForward: threadMessagesToForward };
};

GTxt.MonkeyInTheMiddle._numTexts = function(text){ return Math.ceil(text.length / 160); };

GTxt.MonkeyInTheMiddle._processTxtEmails = function(searchStr, getFrom, getMessageText, config, filterFn) {
    filterFn = filterFn || function(){ return true; };
    var physicalPhoneMessageObjs = [];
    var inboxState = this._getInboxState(searchStr);
    inboxState.threadMessagesToForward.forEach(function(messages){
        var message = messages[0];
        var from = getFrom(message);
        var physicalPhoneNumber = config.getPhysicalPhoneContact().number;
        if(from === physicalPhoneNumber){
            var quickReplyContacts = JSUtil.ArrayUtil.compact(inboxState.allThreads.map(function(thread){
                var from = getFrom(thread.getMessages()[0]);
                return filterFn(from) && from !== physicalPhoneNumber && GTxt.Contact.findByNumber(from);
            }));
            this._txtContacts(messages, quickReplyContacts, getMessageText, function(errorMessage){
                physicalPhoneMessageObjs.push({ message: message, plainMessage: message, text: errorMessage });
            }, config);
        }else if(config.forwardToPhysicalPhone && filterFn(from)){
            var contact = GTxt.Contact.findByNumber(from);
            var plainMessage = JSUtil.ArrayUtil.find(messages, function(msg){ return !msg.getAttachments().length; });
            physicalPhoneMessageObjs.push({
                message: plainMessage || message,
                plainMessage: plainMessage,
                text: [contact ? contact.shortId || (from + '(' + contact.createShortId() + ')') : from].concat(messages.map(function(message){
                    var messageDate = message.getDate();
                    var dateStrings = [JSUtil.DateUtil.toPrettyString(messageDate, true) + '@', messageDate.getHours(), ':' + messageDate.getMinutes()];
                    var dateStr = ['DAYS', 'HRS', 'MINS'].map(function(unit, index){
                        return JSUtil.DateUtil.diff(messageDate, new Date(), unit) ? dateStrings[index] : '';
                    }).join('');
                    return (dateStr && ('(' + dateStr + ')')) + getMessageText(message);
                })).join(this.SEPARATOR)
            });
        }
    }, this);
    return physicalPhoneMessageObjs;
};

GTxt.MonkeyInTheMiddle._sendTxt = function(message, text, contact, config) {
    GTxt.Voice.forwardTxt(message, text, config.gvNumber, contact.number, contact.gvKey);
};

GTxt.MonkeyInTheMiddle._txtContacts = function (messages, quickReplyContacts, getMessageText, onError, config) {
    messages.forEach(function(message){
        getMessageText(message).split(this.DOUBLE_SEPARATOR).forEach(function(messageText){
            var messageParts = messageText.split(this.SEPARATOR);
            var isQuickReply = messageParts.length === 1;

            this._findContacts(quickReplyContacts, !isQuickReply && messageParts[0], onError).forEach(function(contact){
                var text = messageParts[isQuickReply ? 0 : 1];
                this._sendTxt(message, GTxt.Compression.isCompressed(text) ? GTxt.Compression.decompress(text) : text, contact, config);
            }, this);
        }, this);
    }, this);
};
