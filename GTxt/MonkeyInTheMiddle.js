GTxt.MonkeyInTheMiddle = {};

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    var txtInboxState = GTxt.Util.getInboxState('from:' + GTxt.Voice.TXT_DOMAIN + ' subject:' + GTxt.Voice.TXT_SUBJECT);
    var quickReplyContact = GTxt.QuickReplyContactManager.compute(txtInboxState, config);

    GTxt.ReceiverMonkey.txtPhysicalPhone(this._processEmails(
        txtInboxState,
        function(message){ return GTxt.Voice.parseFromTxt(message).number; },
        function(message){
            var lines = GTxt.Voice.getTxtLines(message, function (line) {
                return line === 'To respond to this text message, reply to this email or visit Google Voice.' || JSUtil.StringUtil.startsWith(line, 'YOUR ACCOUNT ');
            });
            var compressedTxt = lines.join('');
            var txt = GTxt.Compression.isCompressed(compressedTxt) ? compressedTxt : lines.join(' ');
            return txt === 'MMS Received' ? '' : txt;
        },
        function(message){ return message.getAttachments().length ? 'MMS' : ''; },
        quickReplyContact,
        config
    ).concat(this._processEmails(
        GTxt.Util.getInboxState('from:' + GTxt.Voice.NO_REPLY_EMAIL + ' subject:' + GTxt.Voice.GROUP_TXT_SUBJECT),
        function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getSubject()); },
        function(){ return ''; },
        function(){ return 'GM'; },
        quickReplyContact,
        config
    )).concat(this._processEmails(
        GTxt.Util.getInboxState('from:' + GTxt.Voice.NO_REPLY_EMAIL + ' subject:' + GTxt.Voice.VOICEMAIL_SUBJECT),
        function(message){
            var subject = message.getSubject();
            var match = subject.match(/from (.+?)\.?$/);
            return GTxt.Voice.getFirstNumberMentioned(subject) || (match ? match[1] : '?');
        },
        function(message){ return GTxt.Voice.getTxtLines(message, function(line){ return line === 'play message'; }).join(' '); },
        function(){ return 'VM'; },
        quickReplyContact,
        config
    )), config);
};

GTxt.MonkeyInTheMiddle._processEmails = function(inboxState, getFrom, getMessageText, getMetadata, quickReplyContact, config) {
    var physicalPhoneMessageObjs = [];
    inboxState.threadMessagesToForward.forEach(function(messages){
        var message = messages[0];
        var from = getFrom(message);
        if(from === config.getPhysicalPhoneContact().number){
            GTxt.SenderMonkey.txtContacts(messages, quickReplyContact, getMessageText, function(errorMessage){
                physicalPhoneMessageObjs.push({ message: message, plainMessage: message, text: errorMessage });
            }, config);
        }else if(config.forwardToPhysicalPhone){
            var plainMessage = JSUtil.ArrayUtil.last(messages.filter(function(m){ return !m.getAttachments().length; }));

            var fromStr = from;
            var contact = GTxt.Contact.findByNumber(from);
            if(contact){
                var quickReplyNotation = contact === quickReplyContact ? '!' : '';
                fromStr = contact.shortId ? contact.shortId + quickReplyNotation : from + '(' + contact.createShortId() + quickReplyNotation + ')';
            }

            var text = [fromStr].concat(messages.map(function(message){
                var messageDate = message.getDate();
                var dateMetadata = (JSUtil.DateUtil.diff(messageDate, new Date()) ? JSUtil.DateUtil.toPrettyString(messageDate, true) + '@' : '') +
                    [messageDate.getHours(), messageDate.getMinutes()].join(':');
                var metadata = JSUtil.ArrayUtil.compact([dateMetadata, getMetadata(message)]).join(',');

                return JSUtil.ArrayUtil.compact([metadata, getMessageText(message)]).join('-');
            })).join(GTxt.SEPARATOR);

            physicalPhoneMessageObjs.push({
                message: plainMessage || message,
                plainMessage: plainMessage,
                text: text
            });
        }
    });
    return physicalPhoneMessageObjs;
};
