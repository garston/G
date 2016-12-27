GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.GV_TXT_DOMAIN = 'txt.voice.google.com';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GmailApp.search('from:' + this.GV_TXT_DOMAIN + ' in:inbox is:unread subject:SMS').forEach(function(thread){
        var messages = GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); });
        if(messages.length) {
            var fromNumber = GASton.Mail.parseFrom(messages[0]).email.match(/^\d+\.1(\d+)/)[1];
            var messageBodies = messages.map(function(message){ return GASton.Mail.getMessageWords(message).join(' '); });
            GASton.Mail.forward(
                JSUtil.ArrayUtil.last(messages),
                [fromNumber].concat(messageBodies).join('|'),
                '1' + config.gvNumber + '.1' + config.getPhysicalPhoneContact().number + '.' + config.getPhysicalPhoneContact().gvKey + '@' + this.GV_TXT_DOMAIN
            );
        }
    }, this);
};
