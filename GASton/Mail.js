GASton.Mail = {};

GASton.Mail.getNameUsedForSending = function() {
    return SpreadsheetApp.getActiveSpreadsheet().getName();
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
}
