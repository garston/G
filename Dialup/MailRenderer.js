Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threadMessages, bodyLength){
    return [Date.now(), ...threadMessages.map(messages => [
        '<table>',
            '<tr>',
                ...this._wrapEach('th', ['', JSUtil.StringUtil.escapeHTML(messages[0].getThread().getFirstMessageSubject()), '', '']),
            '</tr>',
            ...messages.map(m => [
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
    ].join(''))].join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
