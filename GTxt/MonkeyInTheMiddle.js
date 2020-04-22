GTxt.MonkeyInTheMiddle = {};

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GTxt.SenderMonkey.txtContacts(
        ['from:' + config.getPhysicalPhoneContactTxtEmail(), 'subject:' + GTxt.Voice.TXT_SUBJECT],
        function(message){
            var lines = GTxt.Voice.getTxtLines(message);
            var compressedTxt = lines.join('');
            return GTxt.Compression.isCompressed(compressedTxt) ? compressedTxt : lines.join(' ');
        },
        function(){ config.forwardToPhysicalPhone = 1; },
        function(errorMessage, message){ GTxt.ReceiverMonkey.txtPhysicalPhone([{ messages: [message], text: errorMessage }], config); },
        config
    );

    if(config.forwardToPhysicalPhone){
        GTxt.ReceiverMonkey.txtPhysicalPhone(this._processEmails(
            ['from:' + GTxt.Voice.TXT_DOMAIN, '-from:' + config.getPhysicalPhoneContactTxtEmail(), 'subject:' + GTxt.Voice.TXT_SUBJECT],
            function(message){ return GTxt.Voice.parseFromTxt(message).number; },
            function(from, message){ return JSUtil.StringUtil.matchSafe(message.getFrom(), /^"(.+) \(SMS\)"/)[1]; },
            function(message){
                var txt = GTxt.Voice.getTxtLines(message).join(' ');
                return txt === 'MMS Received' ? '' : txt.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '%');
            },
            function(message){ return message.getAttachments().length ? 'MMS' : ''; },
            config
        ).concat(this._processEmails(
            ['from:' + GTxt.Voice.NO_REPLY_EMAIL, 'subject:' + GTxt.Voice.GROUP_TXT_SUBJECT],
            function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getSubject()); },
            function(from){
                var gContact = from && ContactsApp.getContactsByPhone(from)[0];
                return gContact && gContact.getFullName();
            },
            function(){},
            function(){ return 'GM'; },
            config
        )).concat(this._processEmails(
            ['from:' + GTxt.Voice.NO_REPLY_EMAIL, 'subject:' + GTxt.Voice.VOICEMAIL_SUBJECT],
            function(message){
                var subject = message.getSubject();
                return GTxt.Voice.getFirstNumberMentioned(subject) || GTxt.MonkeyInTheMiddle._parseSubject(subject) || '?';
            },
            function(){},
            function(message){ return GTxt.Voice.getTxtLines(message, function(line){ return line === 'play message'; }).join(' '); },
            function(){ return 'VM'; },
            config
        )).concat(this._processEmails(
            ['from:' + GTxt.Voice.NO_REPLY_EMAIL, 'subject:' + GTxt.Voice.MISSED_CALL_SUBJECT],
            function(message){ return GTxt.Voice.getFirstNumberMentioned(message.getBody()); },
            function(from, message){
                var fromStr = GTxt.MonkeyInTheMiddle._parseSubject(message.getSubject());
                return GTxt.Voice.getFirstNumberMentioned(fromStr) !== from && fromStr;
            },
            function(){},
            function(){ return 'MC'; },
            config
        )), config);
    }
};

GTxt.MonkeyInTheMiddle._parseSubject = function(subject){ return JSUtil.StringUtil.matchSafe(subject, /from (.+?)\.?$/)[1]; };

GTxt.MonkeyInTheMiddle._processEmails = function(searchTerms, getFrom, getFromName, getMessageText, getMetadata, config) {
    return GTxt.Util.getThreadMessagesToForward(searchTerms).map(function(messages){
        var from = getFrom(messages[0]);
        var fromStr = [getFromName(from, messages[0]) || from];

        var contact = GTxt.Contact.findByNumber(from);
        if(contact){
            config.quickReplyContactGuid = config.quickReplyContactGuid || contact.guid;
            fromStr = fromStr.concat(['(', contact.shortId || contact.createShortId(), contact === config.getQuickReplyContact() ? '!' : '', ')']);
        }

        return {
            messages: messages,
            text: [fromStr.join('')].concat(messages.map(function(message){
                var messageDate = message.getDate();
                var dateMetadata = (JSUtil.DateUtil.diff(messageDate, new Date()) ? JSUtil.DateUtil.toPrettyString(messageDate, true) + '@' : '') +
                    [messageDate.getHours(), messageDate.getMinutes()].join(':');
                var metadata = JSUtil.ArrayUtil.compact([dateMetadata, getMetadata(message)]).join(',');

                return JSUtil.ArrayUtil.compact([metadata, getMessageText(message)]).join('-');
            })).join(GTxt.SEPARATOR)
        };
    });
};
