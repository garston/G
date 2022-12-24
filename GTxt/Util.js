GTxt.Util = {};

GTxt.Util.mail = function(toEmail, body, derivedFromMsgs){
    GASton.Mail.sendNewEmail(toEmail, '', body);
    derivedFromMsgs.forEach(function(m){
        GASton.Mail.markRead(m);
        GASton.Mail.addLabel(m.getThread(), '_' + SpreadsheetApp.getActiveSpreadsheet().getName());
    });
};

GTxt.Util.getThreadMessagesToForward = (searchTerms) => GASton.Mail.getThreadMessages(
    GmailApp.search(['in:inbox', 'is:unread', 'to:me'].concat(searchTerms).join(' ')),
    m => m.isInInbox() && m.isUnread()
);
