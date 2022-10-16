Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threads, bodyLength){
    return threads.map(t => [
        '<table>',
            '<tr>',
                ...this._wrapEach('th', ['', JSUtil.StringUtil.escapeHTML(t.getFirstMessageSubject()), '', '']),
            '</tr>',
            ...t.getMessages().map(m => [
                `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                ...this._wrapEach('td', [
                    JSUtil.StringUtil.escapeHTML(m.getFrom()),
                    JSUtil.StringUtil.escapeHTML(m.getPlainBody().slice(0, bodyLength)),
                    GASton.Mail.getMessageDatePretty(m),
                    m.getId()
                ]),
                '</tr>'
            ]).flat(),
        '</table>'
    ].join('')).join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
