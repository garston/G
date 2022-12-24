GASton.Mail = {};

GASton.Mail.addLabel = function(thread, label) {
    this._checkProdMode(`${GASton.UPDATE_TYPES.MAIL.ADD_LABEL}: ${label}`, thread.getFirstMessageSubject()) && thread.addLabel(GmailApp.getUserLabelByName(label));
};

GASton.Mail.getMessageDatePretty = (message, omitYear) => {
    const messageDate = message.getDate();
    return (JSUtil.DateUtil.diff(messageDate, new Date()) ? `${JSUtil.DateUtil.toPrettyString(messageDate, omitYear)}@` : '') + JSUtil.DateUtil.timeString(messageDate)
};

GASton.Mail.getMessageWords = function(message) {
    var words = [];
    JSUtil.StringUtil.stripTags(message.getBody().replace(/<br>/gi, '\n')).split('\n').some(function(line) {
        line = line.trim().replace(/\s|&nbsp;/gi, ' ').replace(/\u200B/g, '');
        if(['__________', 'From:'].some(str => line.startsWith(str)) ||
            /^On .+ wrote:/.test(line) ||
            /^In a message dated .+ writes:/.test(line)) {
            return true;
        }

        words = words.concat(JSUtil.ArrayUtil.compact(line.split(' ')));
    });
    return words;
};

GASton.Mail.getNameUsedForSending = function() { return SpreadsheetApp.getActiveSpreadsheet().getName(); };

GASton.Mail.getThreadMessages = (threads, messageFilter) => threads.
    map(t => t.getMessages().filter(messageFilter)).
    filter(messages => messages.length);

GASton.Mail.isSentByScript = function(message){ return message.getFrom().includes(this.getNameUsedForSending()); };

GASton.Mail.markRead = function(message) {
    this._checkProdMode(GASton.UPDATE_TYPES.MAIL.MARK_READ, message.getSubject()) && message.markRead();
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

GASton.Mail.reply = function(msg, body, options){
    this._checkProdMode(GASton.UPDATE_TYPES.MAIL.REPLY, msg.getSubject(), body) && msg.reply(body, this._getOptions(body, options));
};

GASton.Mail.replyAll = function(msg, body, options){
    this._checkProdMode(GASton.UPDATE_TYPES.MAIL.REPLY_ALL, msg.getSubject(), body) && msg.replyAll(body, this._getOptions(body, options));
};

GASton.Mail.sendNewEmail = function(email, subject, body, options){
    this._checkProdMode(GASton.UPDATE_TYPES.MAIL.SEND, subject, body, email) && MailApp.sendEmail(email, subject, JSUtil.StringUtil.stripTags(body), this._getOptions(body, options));
};

GASton.Mail.sendToList = function(email, subject, body){
    this.sendNewEmail(email, subject, body, this._getOptions(body, {replyTo: email}));
};

GASton.Mail.toSearchString = function(date) {
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
};

GASton.Mail._checkProdMode = (actionDesc, subject, body, to) =>
    GASton.checkProdMode([actionDesc, `Subject: ${subject}`, `Body: ${body}`, `To: ${to}`].join('\n'));

GASton.Mail._getOptions = function(body, options){
    return {
        bcc: Session.getActiveUser().getEmail(),
        htmlBody: body,
        name: this.getNameUsedForSending(),
        ...options
    };
};
