GTxt = {};
GTxt.GV_TXT_DOMAIN = 'txt.voice.google.com';

function go() {
    var config = GASton.Database.hydrate(GTxt.Config)[0];
    _changeEnabled(config);

    if(config.isEnabled) {
        _forwardIncomingTexts(config);
    }
}

function _changeEnabled(config) {
    GmailApp.search('from:voice-noreply@google.com is:unread subject:"missed call"').
        reduce(function(messages, thread){ return messages.concat(_determineMessagesToProcess(thread.getMessages())); }, []).
        filter(function(message){ return !message.isInTrash() && message.isUnread() && _isMissedCallAToggleEnabledRequest(message, config); }).
        forEach(function(message){
            config.isEnabled = config.isEnabled ? 0 : 1;
            GASton.Database.persist(GTxt.Config, config);
            GASton.Mail.forward(message, config.isEnabled ? 'Enabled' : 'Disabled', Session.getActiveUser().getEmail());
        });
}

function _determineMessagesToProcess(threadMessages) {
    return threadMessages.reduce(function(messagesToProcess, message){ return GASton.Mail.isSentByUs(message) ? [] : messagesToProcess.concat(message); }, []);
}

function _forwardIncomingTexts(config) {
    GmailApp.search('from:' + GTxt.GV_TXT_DOMAIN + ' in:inbox is:unread subject:SMS').forEach(function(thread){
        var messages = thread.getMessages();
        var fromNumber = GASton.Mail.parseFrom(messages[0]).email.match(/^\d+\.1(\d+)/)[1];
        var messageBodies = _determineMessagesToProcess(messages).
            filter(function(message){ return message.isInInbox() && message.isUnread(); }).
            map(function(message){ return GASton.Mail.getMessageWords(message).join(' '); });

        if(messageBodies.length) {
            GASton.Mail.forward(
                JSUtil.ArrayUtil.last(messages),
                [fromNumber].concat(messageBodies).join('|'),
                '1' + config.gvNumber + '.1' + config.getPhysicalPhoneContact().number + '.' + config.getPhysicalPhoneContact().gvKey + '@' + GTxt.GV_TXT_DOMAIN
            );
        }
    });
}

function _isMissedCallAToggleEnabledRequest(message, config) {
    var missedCallNumber = message.getBody().match(/\((\d+)\) (\d+)-(\d+)/).slice(1).join('');
    return JSUtil.ArrayUtil.contains([config.gvNumber.toString(), config.getPhysicalPhoneContact().number.toString()], missedCallNumber) ||
        JSUtil.StringUtil.contains(config.additionalToggleEnabledNumbers.toString(), missedCallNumber);
}
