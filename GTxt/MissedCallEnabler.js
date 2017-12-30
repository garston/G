GTxt.MissedCallEnabler = {};

GTxt.MissedCallEnabler.changeEnabled = function(config) {
    GmailApp.search('from:' + GTxt.Voice.NO_REPLY_EMAIL + ' is:unread subject:' + GTxt.Voice.MISSED_CALL_SUBJECT).
        reduce(function (messages, thread){ return messages.concat(GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread)); }, []).
        filter(function(message){ return !message.isInTrash() && message.isUnread() && this._isToggleEnabledRequest(message, config); }, this).
        forEach(function(message){
            config.forwardToPhysicalPhone = config.forwardToPhysicalPhone ? 0 : 1;
            GASton.Database.persist(GTxt.Config, config);
            GASton.Mail.forward(message, (config.forwardToPhysicalPhone ? 'Enabled' : 'Disabled') + ' ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(), Session.getActiveUser().getEmail());
            GASton.Mail.markRead(message);
        });
};

GTxt.MissedCallEnabler._isToggleEnabledRequest = function(message, config) {
    var numbersThatCanToggleEnabled = [config.gvNumber, config.getPhysicalPhoneContact().number].
        concat(JSUtil.ArrayUtil.compact(config.additionalToggleEnabledNumbers.toString().split(',').map(function(num){ return +num; })));
    return JSUtil.ArrayUtil.contains(numbersThatCanToggleEnabled, GTxt.Voice.getFirstNumberMentioned(message.getBody()));
};
