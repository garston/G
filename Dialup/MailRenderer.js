Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threadMessages, bodyLength){
    return [Date.now(), ...threadMessages.map(messages => {
        const thread = messages[0].getThread();
        return [
            '<table>',
                '<tr>',
                    ...this._wrapEach('th', ['', JSUtil.StringUtil.escapeHTML(thread.getFirstMessageSubject()), '', thread.getId()]),
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
        ].join('');
    })].join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
