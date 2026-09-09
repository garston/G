namespace Dialup {
    export namespace MailRenderer {
        export const generateHtml = (threadMessages: GoogleAppsScript.Gmail.GmailMessage[][], p: Dialup.Parameter) => {
            const threads = threadMessages.map(([msg]) => msg.getThread());
            const idThreadIds = 't';
            return [
                _wrapEach('div',
                    `Time: ${Date.now()}`,
                    `Thread IDs: <span id="${idThreadIds}">${threads.map(t => t.getId()).join(',')}</span>`
                ).join(''),
                ...threadMessages.map((messages, i) => {
                    const thread = threads[i];
                    return [
                        '<table>',
                            '<tr>',
                                ..._wrapEach('th',
                                    `<input onclick="var e = document.getElementById('${idThreadIds}'); e.innerHTML = e.innerHTML.split(',').filter(function(i){return i !== '${thread.getId()}'}).join(',')" type="button" />`,
                                    JSUtil.StringUtil.escapeHTML(thread.getFirstMessageSubject()),
                                    '',
                                    thread.getId()
                                ),
                            '</tr>',
                            ...messages.map(m => {
                                const from = m.getFrom();
                                const trimmedBody = !p.bodyRaw &&
                                    [GASton.Voice.NO_REPLY_EMAIL, GASton.Voice.TXT_DOMAIN].some(s => from.includes(s)) &&
                                    GASton.Voice.getMessageBody(m);
                                let body = trimmedBody || m.getPlainBody();
                                if(p.bodyLength !== undefined) {
                                    body = body.slice(0, +p.bodyLength);
                                }

                                return [
                                    `<tr${m.isUnread() ? ' style="font-weight: bold"' : ''}>`,
                                    ..._wrapEach('td',
                                        JSUtil.StringUtil.escapeHTML(from),
                                        JSUtil.StringUtil.escapeHTML(body),
                                        GASton.Mail.getMessageDatePretty(m),
                                        m.getId()
                                    ),
                                    '</tr>'
                                ];
                            }).flat(),
                        '</table>'
                    ].join('');
                })
            ].join('<hr/>');
        };

        const _wrapEach = (tag: string, ...htmls: string[]) => htmls.map(h => `<${tag}>${h}</${tag}>`);
    }
}
