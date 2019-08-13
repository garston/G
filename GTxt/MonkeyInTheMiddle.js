GTxt.MonkeyInTheMiddle = {};

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    var receivedTxtsInboxState = GTxt.Util.getInboxState(['from:' + GTxt.Voice.TXT_DOMAIN, '-from:' + config.getPhysicalPhoneContactTxtEmail(), 'subject:' + GTxt.Voice.TXT_SUBJECT]);
    var quickReplyContact = GTxt.QuickReplyContactManager.compute(receivedTxtsInboxState, config);

    GTxt.SenderMonkey.txtContacts(
        ['from:' + config.getPhysicalPhoneContactTxtEmail(), 'subject:' + GTxt.Voice.TXT_SUBJECT],
        quickReplyContact,
        function(message){
            var lines = GTxt.Voice.getTxtLines(message);
            var compressedTxt = lines.join('');
            return GTxt.Compression.isCompressed(compressedTxt) ? compressedTxt : lines.join(' ');
        },
        function(errorMessage, message){ GTxt.ReceiverMonkey.txtPhysicalPhone([{ message: message, plainMessage: message, text: errorMessage }], config); },
        config
    );

    if(config.forwardToPhysicalPhone){
        GTxt.ReceiverMonkey.txtPhysicalPhone(this._processEmails(
            receivedTxtsInboxState,
            function(message){ return GTxt.Voice.parseFromTxt(message).number; },
            function(message){
                var txt = GTxt.Voice.getTxtLines(message).join(' ');
                return txt === 'MMS Received' ? '' : txt;
            },
            function(message){ return message.getAttachments().length ? 'MMS' : ''; },
            quickReplyContact
        ).concat(this._processEmails(
            GTxt.Util.getInboxState(['from:' + GTxt.Voice.NO_REPLY_EMAIL, 'subject:' + GTxt.Voice.GROUP_TXT_SUBJECT]),
            function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getSubject()); },
            function(){ return ''; },
            function(){ return 'GM'; },
            quickReplyContact
        )).concat(this._processEmails(
            GTxt.Util.getInboxState(['from:' + GTxt.Voice.NO_REPLY_EMAIL, 'subject:' + GTxt.Voice.VOICEMAIL_SUBJECT]),
            function(message){
                var subject = message.getSubject();
                var match = subject.match(/from (.+?)\.?$/);
                return GTxt.Voice.getFirstNumberMentioned(subject) || (match ? match[1] : '?');
            },
            function(message){ return GTxt.Voice.getTxtLines(message, function(line){ return line === 'play message'; }).join(' '); },
            function(){ return 'VM'; },
            quickReplyContact
        )), config);
    }
};

GTxt.MonkeyInTheMiddle._processEmails = function(inboxState, getFrom, getMessageText, getMetadata, quickReplyContact) {
    return inboxState.threadMessagesToForward.map(function(messages){
        var from = getFrom(messages[0]);
        var fromStr = from;
        var contact = GTxt.Contact.findByNumber(from);
        if(contact){
            var quickReplyNotation = contact === quickReplyContact ? '!' : '';
            fromStr = contact.shortId ? contact.shortId + quickReplyNotation : from + '(' + contact.createShortId() + quickReplyNotation + ')';
        }

        var plainMessage = JSUtil.ArrayUtil.last(messages.filter(function(m){ return !m.getAttachments().length; }));
        return {
            message: plainMessage || messages[0],
            plainMessage: plainMessage,
            text: [fromStr].concat(messages.map(function(message){
                var messageDate = message.getDate();
                var dateMetadata = (JSUtil.DateUtil.diff(messageDate, new Date()) ? JSUtil.DateUtil.toPrettyString(messageDate, true) + '@' : '') +
                    [messageDate.getHours(), messageDate.getMinutes()].join(':');
                var metadata = JSUtil.ArrayUtil.compact([dateMetadata, getMetadata(message)]).join(',');

                return JSUtil.ArrayUtil.compact([metadata, getMessageText(message)]).join('-');
            })).join(GTxt.SEPARATOR)
        };
    });
};
