GTxt.MissedCallEnabler = {};

GTxt.MissedCallEnabler.changeEnabled = function(config) {
    GmailApp.search('from:' + GTxt.Voice.NO_REPLY_EMAIL + ' is:unread subject:' + GTxt.Voice.MISSED_CALL_SUBJECT).
        reduce(function (messages, thread){ return messages.concat(GASton.Mail.getMessagesAfterLatestMessageSentByScript(thread)); }, []).
        filter(function(message){ return !message.isInTrash() && message.isUnread() && this._isToggleEnabledRequest(message, config); }, this).
        forEach(function(message, i, msgs){
            if(!i || msgs[i-1].getDate().getTime() !== message.getDate().getTime()){
                GASton.Mail.forward(message, config.toggleForwardToPhysicalPhone() + ' ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(), Session.getActiveUser().getEmail());
            }
            GASton.Mail.markRead(message);
        });
};

GTxt.MissedCallEnabler._isToggleEnabledRequest = function(message, config) {
    var numbersThatCanToggleEnabled = [config.gvNumber, config.getPhysicalPhoneContact().number].
        concat(JSUtil.ArrayUtil.compact(config.additionalToggleEnabledNumbers.toString().split(',').map(function(num){ return +num; })));
    return JSUtil.ArrayUtil.contains(numbersThatCanToggleEnabled, GTxt.Voice.getFirstNumberMentioned(message.getBody()));
};
