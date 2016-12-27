GTxt.MissedCallEnabler = {};

GTxt.MissedCallEnabler.changeEnabled = function(config) {
    GmailApp.search('from:voice-noreply@google.com is:unread subject:"missed call"').
        reduce(function (messages, thread){ return messages.concat(GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread)); }, []).
        filter(function(message){ return !message.isInTrash() && message.isUnread() && this._isToggleEnabledRequest(message, config); }, this).
        forEach(function(message){
            config.isEnabled = config.isEnabled ? 0 : 1;
            GASton.Database.persist(GTxt.Config, config);
            GASton.Mail.forward(message, config.isEnabled ? 'Enabled' : 'Disabled', Session.getActiveUser().getEmail());
        });
};

GTxt.MissedCallEnabler._isToggleEnabledRequest = function(message, config) {
    var missedCallNumber = message.getBody().match(/\((\d+)\) (\d+)-(\d+)/).slice(1).join('');
    return JSUtil.ArrayUtil.contains([config.gvNumber.toString(), config.getPhysicalPhoneContact().number.toString()], missedCallNumber) ||
        JSUtil.StringUtil.contains(config.additionalToggleEnabledNumbers.toString(), missedCallNumber);
};
