GTxt.Util = {};

GTxt.Util.getInboxState = function(searchTerms) {
    var allThreads = GmailApp.search(['in:inbox', 'is:unread'].concat(searchTerms).join(' '));
    var threadMessagesToForward = allThreads.
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByScript(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
    return { allThreads: allThreads, threadMessagesToForward: threadMessagesToForward };
};
