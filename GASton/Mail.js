GASton.Mail = {};

GASton.Mail.forward = function(message, body, email) {
    message.forward(this._getEmail(email), this._getOptions(body, email));
};

GASton.Mail.getMessagesAfterLatestMessageSentByUs = function(thread){
    return thread.getMessages().reduce(function(messages, message){ return GASton.Mail.isSentByUs(message) ? [] : messages.concat(message); }, []);
};

GASton.Mail.getMessageWords = function(message) {
    var words = [];
    JSUtil.StringUtil.stripTags(message.getBody().replace(/<br>/gi, '\n')).split('\n').some(function(line) {
        line = line.trim().replace(/\s|&nbsp;/gi, ' ').replace(/\u200B/g, '');
        if(line === '--' ||
            ['__________', 'From:'].some(function(str){ return JSUtil.StringUtil.startsWith(line, str); }) ||
            /^On .+ wrote:/.test(line) ||
            /^In a message dated .+ writes:/.test(line)) {
            return true;
        }

        words = words.concat(JSUtil.ArrayUtil.compact(line.split(' ')));
    });
    return words;
};

GASton.Mail.getNameUsedForSending = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getName();
};

GASton.Mail.isSentByUs = function(message){ return JSUtil.StringUtil.contains(message.getFrom(), this.getNameUsedForSending()); };

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
    if(GASton.PROD_MODE){
        thread.replyAll(body, this._getOptions(body, replyTo));
    }else{
        this._sendNewEmail('test replyAll', body);
    }
};

GASton.Mail.sendToIndividual = function(subject, body, email){
    this._sendNewEmail(subject, body, email);
};

GASton.Mail.sendToList = function(subject, body, email){
    this._sendNewEmail(subject, body, email, email);
};

GASton.Mail._getEmail = function(email){
    return GASton.PROD_MODE ? email : Session.getActiveUser().getEmail();
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
    MailApp.sendEmail(this._getEmail(email), subject, JSUtil.StringUtil.stripTags(body), this._getOptions(body, replyTo));
};
