Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = () => GmailApp.search('in:inbox').map(t => [
    '<table>',
        '<tr>',
            '<th></th>',
            `<th>${t.getFirstMessageSubject()}</th>`,
            '<th></th>',
        '</tr>',
        ...t.getMessages().map(m => {
            const from = GASton.Mail.parseFrom(m);
            return [
                `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                    `<td>${from.firstName || from.lastName ? `${from.firstName} ${from.lastName}` : from.email}</td>`,
                    `<td>${JSUtil.StringUtil.escapeHTML(m.getPlainBody())}</td>`,
                    `<td>${GASton.Mail.getMessageDatePretty(m)}</td>`,
                '</tr>'
            ].join('');
        }),
        '</table>'
].join(''));
