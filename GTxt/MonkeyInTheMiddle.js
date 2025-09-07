GTxt.MonkeyInTheMiddle = {};

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GTxt.SenderMonkey.txtContacts(
        [`from:${config.getPhysicalPhoneContactTxtEmail()}`, `subject:${GASton.Voice.TXT_SUBJECT}`],
        function(message){
            const lines = GASton.Voice.getTxtLines(message);
            var compressedTxt = lines.join('');
            return GTxt.Compression.isCompressed(compressedTxt) ? compressedTxt : lines.join(' ');
        },
        contact => {
            config.forwardToPhysicalPhone = 1;
            config.setQuickReplyContact(contact);
        },
        function(errorMessage, message){ GTxt.ReceiverMonkey.txtPhysicalPhone([{ messages: [message], text: errorMessage }], config); },
        config
    );

    if(config.forwardToPhysicalPhone){
        GTxt.ReceiverMonkey.txtPhysicalPhone(this._processEmails(
            [`from:${GASton.Voice.TXT_DOMAIN}`, `-from:${config.getPhysicalPhoneContactTxtEmail()}`, `subject:${GASton.Voice.TXT_SUBJECT}`],
            message => GASton.Voice.parseFromTxt(message).number,
            function(message){
                const txt = GASton.Voice.getTxtLines(message).join(' ');
                return txt === 'MMS Received' ? '' : txt.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '%');
            },
            function(message){ return message.getAttachments().length ? 'MMS' : ''; },
            config
        ).concat(this._processEmails(
            [`from:${GASton.Voice.NO_REPLY_EMAIL}`, `subject:${GASton.Voice.GROUP_TXT_SUBJECT}`],
            message => GASton.Voice.getFirstNumberMentioned(message.getSubject()),
            function(){},
            function(){ return 'GM'; },
            config
        )).concat(this._processEmails(
            [`from:${GASton.Voice.NO_REPLY_EMAIL}`, `subject:${GASton.Voice.VOICEMAIL_SUBJECT}`],
            message => GASton.Voice.getFirstNumberMentioned(message.getSubject()),
            message => GASton.Voice.getTxtLines(message, line => line === 'play message').join(' '),
            function(){ return 'VM'; },
            config,
            true
        )).concat(this._processEmails(
            [`from:${GASton.Voice.NO_REPLY_EMAIL}`, `subject:${GASton.Voice.MISSED_CALL_SUBJECT}`],
            message => GASton.Voice.getFirstNumberMentioned(message.getBody()),
            function(){},
            function(){ return 'MC'; },
            config,
            true
        )), config);
    }
};

GTxt.MonkeyInTheMiddle._processEmails = function(searchTerms, getFrom, getMessageText, getMetadata, config, isEmptyMsgFromUnknownNumOptional) {
    return GTxt.Util.getThreadMessagesToForward(searchTerms).map(function(messages){
        var from = getFrom(messages[0]);
        let fromStr = (JSUtil.StringUtil.matchSafe(messages[0].getSubject(), /from ([^(\d.]*)/i)[1] || '').trim() || from;

        const contact = from && GTxt.Contact.findByNumber(from);
        if(contact){
            config.setQuickReplyContact(contact);
            fromStr += `(${contact.hasShortId() ? contact.shortId : contact.createShortId()}${contact === config.getQuickReplyContact() ? '!' : ''})`;
        }

        const msgTexts = messages.map(getMessageText);
        return {
            messages: messages,
            optional: isEmptyMsgFromUnknownNumOptional && fromStr === from && msgTexts.every(txt => !txt),
            text: [fromStr, ...messages.map((message, i) => {
                const metadata = JSUtil.ArrayUtil.compact([GASton.Mail.getMessageDatePretty(message, true), getMetadata(message)]).join(',');
                return JSUtil.ArrayUtil.compact([metadata, msgTexts[i]]).join('-');
            })].join(GTxt.SEPARATOR)
        };
    });
};
