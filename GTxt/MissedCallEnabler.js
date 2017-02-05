GTxt.MissedCallEnabler = {};

GTxt.MissedCallEnabler.changeEnabled = function(config) {
    GmailApp.search('from:voice-noreply@google.com is:unread subject:' + GASton.Voice.MISSED_CALL_SUBJECT).
        reduce(function (messages, thread){ return messages.concat(GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread)); }, []).
        filter(function(message){ return !message.isInTrash() && message.isUnread() && this._isToggleEnabledRequest(message, config); }, this).
        forEach(function(message){
            config.isEnabled = config.isEnabled ? 0 : 1;
            GASton.Database.persist(GTxt.Config, config);
            GASton.Mail.forward(message, (config.isEnabled ? 'Enabled' : 'Disabled') + ' ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(), Session.getActiveUser().getEmail());
        });
};

GTxt.MissedCallEnabler._isToggleEnabledRequest = function(message, config) {
    var numbersThatCanToggleEnabled = [config.gvNumber.toString(), config.getPhysicalPhoneContact().number.toString()].
        concat(JSUtil.ArrayUtil.compact(config.additionalToggleEnabledNumbers.toString().split(',')));
    return JSUtil.ArrayUtil.contains(numbersThatCanToggleEnabled, GASton.Voice.getMissedCallNumber(message));
};
