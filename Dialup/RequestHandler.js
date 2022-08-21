Dialup.RequestHandler = {};
Dialup.RequestHandler.handle = ({action, body, q, subject, to}) => {
    switch (action) {
        case 'c':
            GASton.Mail.sendNewEmail(to, subject, body, { htmlBody: body, name: 'Garston Tremblay' });
            break;
        case undefined:
            break;
        default:
            return `invalid action '${action}'`
    }

    return Dialup.MailRenderer.generateHtml(q).join('');
};
