Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(query = 'in:inbox'){
    return GmailApp.search(query).map(t => [
        '<table>',
            '<tr>',
                ...this._wrapEach('th', ['', JSUtil.StringUtil.escapeHTML(t.getFirstMessageSubject()), '', '']),
            '</tr>',
            ...t.getMessages().map(m => [
                `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                ...this._wrapEach('td', [
                    JSUtil.StringUtil.escapeHTML(m.getFrom()),
                    JSUtil.StringUtil.escapeHTML(m.getPlainBody()),
                    GASton.Mail.getMessageDatePretty(m),
                    m.getId()
                ]),
                '</tr>'
            ]).flat(),
        '</table>'
    ].join('')).join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
