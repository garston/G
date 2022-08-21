Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(query = 'in:inbox'){
    return GmailApp.search(query).map(t => [
        '<table>',
            '<tr>',
                ...this._wrapEach('th', ['', t.getFirstMessageSubject(), '', '']),
            '</tr>',
            ...t.getMessages().map(m => {
                const from = GASton.Mail.parseFrom(m);
                return [
                    `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                        ...this._wrapEach('td', [
                            from.firstName || from.lastName ? `${from.firstName} ${from.lastName}` : from.email,
                            JSUtil.StringUtil.escapeHTML(m.getPlainBody()),
                            GASton.Mail.getMessageDatePretty(m),
                            m.getId()
                        ]),
                    '</tr>'
                ];
            }).flat(),
        '</table>'
    ]).flat();
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
