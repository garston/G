GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';
GTxt.MonkeyInTheMiddle.DOUBLE_SEPARATOR = '||';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    this._processTxtEmails(
        'from:' + GTxt.Voice.TXT_DOMAIN + ' subject:' + GTxt.Voice.TXT_SUBJECT,
        function(message){ return GTxt.Voice.parseFromTxt(message).number; },
        GTxt.Voice.getTxt,
        config
    ).concat(this._processTxtEmails(
        'from:' + GTxt.Voice.NO_REPLY_EMAIL + ' subject:' + GTxt.Voice.GROUP_TXT_SUBJECT,
        function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getSubject()); },
        function(){ return 'Group msg'; },
        config
    )).forEach(function(obj, index, objs){
        if(index){
            GASton.Mail.forward(obj.message, 'Handled by batch: ' + objs[0].message.getSubject(), Session.getActiveUser().getEmail());
        }else{
            var text = objs.map(function(obj){ return obj.text; }).join(this.DOUBLE_SEPARATOR);
            this._sendTxt(obj.message, GTxt.Compression.compress(text), config.getPhysicalPhoneContact(), config);
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

GTxt.MonkeyInTheMiddle._processTxtEmails = function(searchStr, getFromNumber, getMessageText, config) {
    var physicalPhoneMessageObjs = [];
    this._getThreadMessagesToForward(searchStr).forEach(function(messages){
        var message = messages[0];
        var fromNumber = getFromNumber(message);
        if(fromNumber === config.getPhysicalPhoneContact().number){
            this._txtContacts(messages, getMessageText, function(errorMessage){
                physicalPhoneMessageObjs.push({ message: message, text: errorMessage });
            }, config);
        }else if(config.forwardToPhysicalPhone){
            var contact = GASton.Database.findBy(GTxt.Contact, 'number', fromNumber);
            physicalPhoneMessageObjs.push({
                message: message,
                text: [contact ? contact.shortId || (fromNumber + '(' + contact.createShortId() + ')') : fromNumber].concat(messages.map(function(message){
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

GTxt.MonkeyInTheMiddle._txtContacts = function (messages, getMessageText, onContactNotFound, config) {
    messages.forEach(function(message){
        getMessageText(message).split(this.DOUBLE_SEPARATOR).forEach(function(messageText){
            var messageParts = messageText.split(this.SEPARATOR);
            messageParts[0].split(',').forEach(function(number){
                var contact = GASton.Database.findBy(GTxt.Contact, 'shortId', +number) || GASton.Database.findBy(GTxt.Contact, 'number', +number);
                if(contact){
                    this._sendTxt(message, GTxt.Compression.decompress(messageParts[1]), contact, config);
                }else{
                    onContactNotFound.call(this, 'Cannot find ' + number);
                }
            }, this);
        }, this);
    }, this);
};
