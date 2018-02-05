GASton.Mail = {};

GASton.Mail.forward = function(message, body, email) {
    this._checkProdMode('FORWARD', message.getThread().getFirstMessageSubject(), email, null, body) &&
        message.forward(email, this._getOptions(body));
};

GASton.Mail.getMessagesAfterLatestMessageSentByScript = function(thread){
    return thread.getMessages().reduce(function(messages, message){ return GASton.Mail.isSentByScript(message) ? [] : messages.concat(message); }, []);
};

GASton.Mail.getMessageWords = function(message) {
    var words = [];
    JSUtil.StringUtil.stripTags(message.getBody().replace(/<br>/gi, '\n')).split('\n').some(function(line) {
        line = line.trim().replace(/\s|&nbsp;/gi, ' ').replace(/\u200B/g, '');
        if(['__________', 'From:'].some(function(str){ return JSUtil.StringUtil.startsWith(line, str); }) ||
            /^On .+ wrote:/.test(line) ||
            /^In a message dated .+ writes:/.test(line)) {
            return true;
        }

        words = words.concat(JSUtil.ArrayUtil.compact(line.split(' ')));
    });
    return words;
};

GASton.Mail.getNameUsedForSending = function() { return SpreadsheetApp.getActiveSpreadsheet().getName(); };
GASton.Mail.isSentByScript = function(message){ return JSUtil.StringUtil.contains(message.getFrom(), this.getNameUsedForSending()); };

GASton.Mail.markRead = function(message) {
    this._checkProdMode('MARK READ', message.getThread().getFirstMessageSubject()) && message.markRead();
};

GASton.Mail.parseFrom = function(message){
    return message.getFrom().
        replace(/^"(.+), ([^ ]+).*"(.+)/, '$2 $1$3').
        split(' ').
        reduce(function(parsed, part, index, parts) {
            if(parts.length === 1 || index === parts.length - 1) {
                parsed.email = part.replace(/[<>]/g, '');
            } else if(index) {
                parsed.lastName = (parsed.lastName ? parsed.lastName + ' ' : '') + part;
            } else {
                parsed.firstName = part;
            }
            return parsed;
        }, {email: '', firstName: '', lastName: ''});
};

GASton.Mail.replyAll = function(thread, body, replyTo){
    this._checkProdMode('REPLY ALL', thread.getFirstMessageSubject(), null, replyTo, body) &&
        thread.replyAll(body, this._getOptions(body, replyTo));
};

GASton.Mail.sendToIndividual = function(subject, body, email){
    this._sendNewEmail(subject, body, email);
};

GASton.Mail.sendToList = function(subject, body, email){
    this._sendNewEmail(subject, body, email, email);
};

GASton.Mail.toSearchString = function(date) {
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
};

GASton.Mail._checkProdMode = function (actionDesc, threadSubject, to, replyTo, body){
    return GASton.checkProdMode('%s\nThread Subject: %s\nTo: %s\nReply-To: %s\nBody: %s', [actionDesc, threadSubject, to, replyTo, body]);
};

GASton.Mail._getOptions = function(body, replyTo){
    return {
        bcc: Session.getActiveUser().getEmail(),
        htmlBody: body,
        name: this.getNameUsedForSending(),
        replyTo: replyTo
    };
};

GASton.Mail._sendNewEmail = function(subject, body, email, replyTo) {
    this._checkProdMode('NEW EMAIL', subject, email, replyTo, body) &&
        MailApp.sendEmail(email, subject, JSUtil.StringUtil.stripTags(body), this._getOptions(body, replyTo));
};
