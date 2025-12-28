Dialup.MailRenderer = {};
Dialup.MailRenderer.generateHtml = function(threadMessages, p){
    const threads = threadMessages.map(([msg]) => msg.getThread());
    const idThreadIds = 't';
    return [
        this._wrapEach('div', [
            `Time: ${Date.now()}`,
            `Thread IDs: <span id="${idThreadIds}">${threads.map(t => t.getId()).join(',')}</span>`
        ]).join(''),
        ...threadMessages.map((messages, i) => {
            const thread = threads[i];
            return [
                '<table>',
                    '<tr>',
                        ...this._wrapEach('th', [
                            `<input onclick="var e = document.getElementById('${idThreadIds}'); e.innerHTML = e.innerHTML.split(',').filter(function(i){return i !== '${thread.getId()}'}).join(',')" type="button" />`,
                            JSUtil.StringUtil.escapeHTML(thread.getFirstMessageSubject()),
                            '',
                            thread.getId()
                        ]),
                    '</tr>',
                    ...messages.map(m => {
                        const from = m.getFrom();
                        const trimmedBody = !p.bodyRaw &&
                            [GASton.Voice.NO_REPLY_EMAIL, GASton.Voice.TXT_DOMAIN].some(s => from.includes(s)) &&
                            GASton.Voice.getMessageBody(m);

                        return [
                            `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                            ...this._wrapEach('td', [
                                JSUtil.StringUtil.escapeHTML(from),
                                JSUtil.StringUtil.escapeHTML((trimmedBody || m.getPlainBody()).slice(0, p.bodyLength)),
                                GASton.Mail.getMessageDatePretty(m),
                                m.getId()
                            ]),
                            '</tr>'
                        ];
                    }).flat(),
                '</table>'
            ].join('');
        })
    ].join('<hr/>');
};

Dialup.MailRenderer._wrapEach = (tag, htmlArray) => htmlArray.map(h => `<${tag}>${h}</${tag}>`);
