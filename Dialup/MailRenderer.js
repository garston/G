Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threadMessages, bodyLength){
    const threads = threadMessages.map(([msg]) => msg.getThread());
    return [
        this._wrapEach('div', [`Time: ${Date.now()}`, `Thread IDs: ${threads.map(t => t.getId()).join(',')}`]).join(''),
        ...threadMessages.map((messages, i) => [
            '<table>',
                '<tr>',
                    ...this._wrapEach('th', ['', JSUtil.StringUtil.escapeHTML(threads[i].getFirstMessageSubject()), '', threads[i].getId()]),
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
        ].join(''))
    ].join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
