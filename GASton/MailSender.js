GASton.MailSender = {};

GASton.MailSender.getNameUsedForSending = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getName();
};

GASton.MailSender.replyAll = function(thread, body, replyTo){
    if(GASton.PROD_MODE){
        thread.replyAll(body, this._getOptions(body, replyTo));
    }else{
        this._sendNewEmail('test replyAll', body);
    }
};

GASton.MailSender.sendToIndividual = function(subject, body, email){
    this._sendNewEmail(subject, body, email);
};

GASton.MailSender.sendToList = function(subject, body, email){
    this._sendNewEmail(subject, body, email, email);
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

GASton.MailSender._sendNewEmail = function(subject, body, email, replyTo) {
    MailApp.sendEmail(this._getEmail(email), subject, JSUtil.StringUtil.stripTags(body), this._getOptions(body, replyTo));
}
