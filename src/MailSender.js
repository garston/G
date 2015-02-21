MailSender = {};

MailSender.getNameUsedForSending = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getName();
};

MailSender.forward = function(message, email, body) {
    message.forward(this._getEmail(email), this._getOptions(body, email));
};

MailSender.replyAll = function(thread, body, replyTo){
    if(GASTON_PROD_MODE){
        thread.replyAll(body, this._getOptions(body, replyTo));
    }else{
        this.send('test replyAll', body);
    }
};

MailSender.send = function(subject, body, email){
    MailApp.sendEmail(this._getEmail(email), subject, this._getPlainBody(body), this._getOptions(body, email));
};

MailSender._getEmail = function(email){
    return GASTON_PROD_MODE ? email : Session.getActiveUser().getEmail();
};

MailSender._getOptions = function(body, replyTo){
    return {
        bcc: Session.getActiveUser().getEmail(),
        htmlBody: body,
        name: this.getNameUsedForSending(),
        replyTo: replyTo
    };
};

MailSender._getPlainBody = function(body){
    return body.replace(/(<([^>]+)>)/ig, '');
};
