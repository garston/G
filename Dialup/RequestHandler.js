Dialup.RequestHandler = {};
Dialup.RequestHandler.handle = p => {
    const emailOptions = {bcc: '', name: 'Garston Tremblay'};
    switch (p.action) {
        case 'a':
            GASton.Mail.replyAll(GmailApp.getMessageById(p.id), p.body, emailOptions);
            break;
        case 'c':
            GASton.Mail.sendNewEmail(p.to, p.subject, p.body, emailOptions);
            break;
        case 'd':
            p.ids.split(',').forEach(i => GASton.Mail.moveToTrash(GmailApp.getThreadById(i) || GmailApp.getMessageById(i)));
            break;
        case 'r':
            GASton.Mail.reply(GmailApp.getMessageById(p.id), p.body, emailOptions);
            break;
        case undefined:
            break;
        default:
            return `invalid action '${p.action}'`
    }

    return Dialup.MailRenderer.generateHtml(GASton.Mail.getThreadMessages(
        GmailApp.search(p.q || 'in:inbox'), m => m.getDate().getTime() > (p.after || 0) && (/in:(anywhere|trash)/.test(p.q) || !m.isInTrash())
    ), p.bodyLength);
};
