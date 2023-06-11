Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threadMessages, bodyLength){
    const threads = threadMessages.map(([msg]) => msg.getThread());
    const idThreadIds = 't';
    return [
        this._wrapEach('div', [
            `Time: ${Date.now()}`,
            `Thread IDs: <span id="${idThreadIds}">${threads.map(t => t.getId()).join(',')}</span>`
        ]).join(''),
        ...threadMessages.map((messages, i) => [
            '<table>',
                '<tr>',
                    ...this._wrapEach('th', [
                        `<input onclick="var e = document.getElementById('${idThreadIds}'); e.innerHTML = e.innerHTML.split(',').filter(function(i){return i !== '${threads[i].getId()}'}).join(',')" type="button" />`,
                        JSUtil.StringUtil.escapeHTML(threads[i].getFirstMessageSubject()),
                        '',
                        threads[i].getId()
                    ]),
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
