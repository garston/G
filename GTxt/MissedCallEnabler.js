GTxt.MissedCallEnabler = {};

GTxt.MissedCallEnabler.changeEnabled = function(config) {
    GmailApp.search('from:' + GTxt.Voice.NO_REPLY_EMAIL + ' is:unread subject:' + GTxt.Voice.MISSED_CALL_SUBJECT).forEach(function(t){
        t.getMessages().filter(function(m){ return !m.isInTrash() && m.isUnread() && this._isToggleEnabledRequest(m, config); }, this).forEach(function(m, i, msgs){
            GTxt.Util.mail(
                Session.getActiveUser().getEmail(),
                i && msgs[i-1].getDate().getTime() === m.getDate().getTime() ? 'duplicate missed call email' : config.toggleForwardToPhysicalPhone() + ' ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
                [m]
            );
        });
    }, this);
};

GTxt.MissedCallEnabler._isToggleEnabledRequest = function(message, config) {
    var numbersThatCanToggleEnabled = [config.gvNumber, config.getPhysicalPhoneContact().number].
        concat(JSUtil.ArrayUtil.compact(config.additionalToggleEnabledNumbers.toString().split(',').map(function(num){ return +num; })));
    return JSUtil.ArrayUtil.contains(numbersThatCanToggleEnabled, GTxt.Voice.getFirstNumberMentioned(message.getBody()));
};
