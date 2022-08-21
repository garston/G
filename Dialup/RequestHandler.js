Dialup.RequestHandler = {};
Dialup.RequestHandler.handle = ({action, body, id, q, subject, to}) => {
    const emailOptions = {bcc: '', name: 'Garston Tremblay'};
    switch (action) {
        case 'a':
            GASton.Mail.replyAll(GmailApp.getMessageById(id), body, emailOptions);
            break;
        case 'c':
            GASton.Mail.sendNewEmail(to, subject, body, emailOptions);
            break;
        case undefined:
            break;
        default:
            return `invalid action '${action}'`
    }

    return Dialup.MailRenderer.generateHtml(q).join('');
};
