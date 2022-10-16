Dialup.RequestHandler = {};
Dialup.RequestHandler.handle = ({action, body, bodyLength, id, q = 'in:inbox', subject, to}) => {
    const emailOptions = {bcc: '', name: 'Garston Tremblay'};
    switch (action) {
        case 'a':
            GASton.Mail.replyAll(GmailApp.getMessageById(id), body, emailOptions);
            break;
        case 'c':
            GASton.Mail.sendNewEmail(to, subject, body, emailOptions);
            break;
        case 'r':
            GASton.Mail.reply(GmailApp.getMessageById(id), body, emailOptions);
            break;
        case undefined:
            break;
        default:
            return `invalid action '${action}'`
    }

    return Dialup.MailRenderer.generateHtml(GmailApp.search(q), bodyLength);
};
