GTxt.Util = {};

GTxt.Util.getInboxState = function(searchStr) {
    var allThreads = GmailApp.search('in:inbox is:unread ' + searchStr);
    var threadMessagesToForward = allThreads.
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByScript(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
    return { allThreads: allThreads, threadMessagesToForward: threadMessagesToForward };
};

GTxt.Util.sendTxt = function(message, text, contact, config) {
    GTxt.Voice.forwardTxt(message, text, config.gvNumber, contact.number, contact.gvKey);
};
