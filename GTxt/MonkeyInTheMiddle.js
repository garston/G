GTxt.MonkeyInTheMiddle = {};

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GTxt.ReceiverMonkey.txtPhysicalPhone(this._processTxtEmails(
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
    )), config);
};

GTxt.MonkeyInTheMiddle._processTxtEmails = function(searchStr, getFrom, getMessageText, config, filterFn) {
    filterFn = filterFn || function(){ return true; };
    var physicalPhoneMessageObjs = [];
    var inboxState = GTxt.Util.getInboxState(searchStr);
    inboxState.threadMessagesToForward.forEach(function(messages){
        var message = messages[0];
        var from = getFrom(message);
        var physicalPhoneNumber = config.getPhysicalPhoneContact().number;
        if(from === physicalPhoneNumber){
            var quickReplyContacts = JSUtil.ArrayUtil.compact(inboxState.allThreads.map(function(thread){
                var from = getFrom(thread.getMessages()[0]);
                return filterFn(from) && from !== physicalPhoneNumber && GTxt.Contact.findByNumber(from);
            }));
            GTxt.SenderMonkey.txtContacts(messages, quickReplyContacts, getMessageText, function(errorMessage){
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
                })).join(GTxt.SEPARATOR)
            });
        }
    });
    return physicalPhoneMessageObjs;
};
