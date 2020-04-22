GTxt.Util = {};

GTxt.Util.mail = function(toEmail, body, derivedFromMsgs){
    GASton.Mail.sendToIndividual(Date.now().toString(), body, toEmail);
    derivedFromMsgs.forEach(function(m){
        GASton.Mail.markRead(m);
        GASton.Mail.addLabel(m.getThread(), '_' + SpreadsheetApp.getActiveSpreadsheet().getName());
    });
};

GTxt.Util.getThreadMessagesToForward = function(searchTerms) {
    return GmailApp.search(['in:inbox', 'is:unread', 'to:me'].concat(searchTerms).join(' ')).
        map(function(t){ return t.getMessages().filter(function(m){ return m.isInInbox() && m.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
};
