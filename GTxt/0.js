GTxt = {};
GTxt.GV_TXT_DOMAIN = 'txt.voice.google.com';

function forwardIncomingTexts() {
    GmailApp.search('from:' + GTxt.GV_TXT_DOMAIN + ' in:inbox is:unread subject:SMS').forEach(function(thread){
        var messages = thread.getMessages();
        var fromNumber = GASton.Mail.parseFrom(messages[0]).email.match(/^\d+\.1(\d+)/)[1];
        var messageBodies = messages.
            reduce(function(messagesToProcess, message){
                return GASton.Mail.isSentByUs(message) ? [] : messagesToProcess.concat(message.isInInbox() && message.isUnread() ? message : []);
            }, []).
            map(function(message){ return GASton.Mail.getMessageWords(message).join(' '); });

        if(messageBodies.length) {
            var config = GASton.Database.hydrate(GTxt.Config)[0];
            var physicalPhoneContact = GASton.Database.findBy(GTxt.Contact, 'guid', config.physicalPhoneContactGuid);
            var forwardingEmail = '1' + config.gvNumber + '.1' + physicalPhoneContact.number + '.' + physicalPhoneContact.gvKey + '@' + GTxt.GV_TXT_DOMAIN;

            GASton.Mail.forward(JSUtil.ArrayUtil.last(messages), [fromNumber].concat(messageBodies).join('|'), forwardingEmail);
        }
    });
}
