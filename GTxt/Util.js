GTxt.Util = {};

GTxt.Util.getInboxState = function(searchTerms) {
    var allThreads = GmailApp.search(['in:inbox', 'is:unread'].concat(searchTerms).join(' '));
    var threadMessagesToForward = allThreads.
        map(function(t){ return t.getMessages().filter(function(m){ return m.isInInbox() && m.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
    return { allThreads: allThreads, threadMessagesToForward: threadMessagesToForward };
};

GTxt.Util.mail = function(toEmail, body, derivedFromMsgs){
    GASton.Mail.sendToIndividual(Date.now().toString(), body, toEmail);
    derivedFromMsgs.forEach(function(m){ GASton.Mail.markRead(m); });
};
