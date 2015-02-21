GASton.MailSender = {};

GASton.MailSender.getNameUsedForSending = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getName();
};

GASton.MailSender.forward = function(message, email, body) {
    message.forward(this._getEmail(email), this._getOptions(body, email));
};

GASton.MailSender.replyAll = function(thread, body, replyTo){
    if(GASton.PROD_MODE){
        thread.replyAll(body, this._getOptions(body, replyTo));
    }else{
        this.send('test replyAll', body);
    }
};

GASton.MailSender.send = function(subject, body, email){
    MailApp.sendEmail(this._getEmail(email), subject, this._getPlainBody(body), this._getOptions(body, email));
};

GASton.MailSender._getEmail = function(email){
    return GASton.PROD_MODE ? email : Session.getActiveUser().getEmail();
};

GASton.MailSender._getOptions = function(body, replyTo){
    return {
        bcc: Session.getActiveUser().getEmail(),
        htmlBody: body,
        name: this.getNameUsedForSending(),
        replyTo: replyTo
    };
};

GASton.MailSender._getPlainBody = function(body){
    return body.replace(/(<([^>]+)>)/ig, '');
};
