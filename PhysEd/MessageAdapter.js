PhysEd.MessageAdapter = {};

PhysEd.MessageAdapter.flowdockMessages = function(flowdockMessages, flowdock) {
    var users = flowdock.fetchUsers();
    return flowdockMessages.map(function(m){
        var user = JSUtil.ArrayUtil.find(users, function(u){ return u.id === +m.user });
        var userNameParts = user.name.split(' ');
        return {
            date: new Date(m.sent),
            fromParts: {
                email: user.email,
                firstName: userNameParts[0],
                lastName: userNameParts.slice(1).join(' ')
            },
            sentByScript: flowdock.isSentByScript(m),
            words: m.content.split(' ')
        };
    });
};

PhysEd.MessageAdapter.gmailThreads = function(threads) {
    return threads.reduce(function(msgs, thread){
        return msgs.concat(thread.getMessages().map(function(m){
            return {
                date: m.getDate(),
                fromParts: GASton.Mail.parseFrom(m),
                sentByScript: GASton.Mail.isSentByScript(m),
                words: GASton.Mail.getMessageWords(m)
            };
        }));
    }, []);
};
