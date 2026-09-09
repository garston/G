namespace GASton {
    export namespace Mail {
        export const addLabel = (thread: GoogleAppsScript.Gmail.GmailThread, label: string) => {
            _checkProdMode(`${GASton.UPDATE_TYPES.MAIL.ADD_LABEL}: ${label}`, thread.getFirstMessageSubject()) &&
                thread.addLabel(GmailApp.getUserLabelByName(label));
        };

        export const getMessageDatePretty = (message: GoogleAppsScript.Gmail.GmailMessage, omitYear?: boolean) => {
            const messageDate = message.getDate();
            return (JSUtil.DateUtil.diff(messageDate, new Date()) ? `${JSUtil.DateUtil.toPrettyString(messageDate, omitYear)}@` : '') + JSUtil.DateUtil.timeString(messageDate)
        };

        export const getMessageWords = (message: GoogleAppsScript.Gmail.GmailMessage) => {
            let words: string[] = [];
            JSUtil.StringUtil.stripTags(message.getBody().replace(/<br>/gi, '\n')).split('\n').some((line) => {
                line = line.trim().replace(/\s|&nbsp;/gi, ' ').replace(/\u200B/g, '');
                if(['__________', 'From:'].some(str => line.startsWith(str)) ||
                    /^On .+ wrote:/.test(line) ||
                    /^In a message dated .+ writes:/.test(line)) {
                    return true;
                }

                words = words.concat(JSUtil.ArrayUtil.compact(line.split(' ')));
                return false;
            });
            return words;
        };

        export const getNameUsedForSending = () => SpreadsheetApp.getActiveSpreadsheet().getName();

        export const getThreadMessages = (threads: GoogleAppsScript.Gmail.GmailThread[], messageFilter: (msg: GoogleAppsScript.Gmail.GmailMessage) => boolean) =>
            threads.
                map(t => t.getMessages().filter(messageFilter)).
                filter(messages => messages.length);

        export const isSentByScript = (message: GoogleAppsScript.Gmail.GmailMessage) => message.getFrom().includes(getNameUsedForSending());

        export const markRead = (message: GoogleAppsScript.Gmail.GmailMessage) => {
            _checkProdMode(GASton.UPDATE_TYPES.MAIL.MARK_READ, message.getSubject()) &&
                message.markRead();
        };

        export const moveToTrash = function(threadOrMsg: GoogleAppsScript.Gmail.GmailMessage | GoogleAppsScript.Gmail.GmailThread) {
            _checkProdMode(`${GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH}: ${threadOrMsg.getId()}`) &&
                threadOrMsg.moveToTrash();
        };

        export const parseFrom = (message: GoogleAppsScript.Gmail.GmailMessage) => message.getFrom().
            replace(/^"(.+), ([^ ]+).*"(.+)/, '$2 $1$3').
            split(' ').
            reduce((parsed, part, index, parts) => {
                if(parts.length === 1 || index === parts.length - 1) {
                    parsed.email = part.replace(/[<>]/g, '');
                } else if(index) {
                    parsed.lastName = (parsed.lastName ? parsed.lastName + ' ' : '') + part;
                } else {
                    parsed.firstName = part;
                }
                return parsed;
            }, {email: '', firstName: '', lastName: ''});
        
        export const reply = (msg: GoogleAppsScript.Gmail.GmailMessage, body: string, options?: GoogleAppsScript.Gmail.GmailAdvancedOptions) => {
            _checkProdMode(GASton.UPDATE_TYPES.MAIL.REPLY, msg.getSubject(), body) &&
                msg.reply(body, _getOptions(body, options));
        };

        export const replyAll = (msg: GoogleAppsScript.Gmail.GmailMessage, body: string, options?: GoogleAppsScript.Gmail.GmailAdvancedOptions) => {
            _checkProdMode(GASton.UPDATE_TYPES.MAIL.REPLY_ALL, msg.getSubject(), body) &&
                msg.replyAll(body, _getOptions(body, options));
        };

        export const sendNewEmail = (email: string, subject: string, body: string, options?: GoogleAppsScript.Gmail.GmailAdvancedOptions) =>
            _checkProdMode(GASton.UPDATE_TYPES.MAIL.SEND, subject, body, email) &&
                MailApp.sendEmail(email, subject, JSUtil.StringUtil.stripTags(body), _getOptions(body, options));

        export const sendToList = (email: string, subject: string, body: string) => sendNewEmail(email, subject, body, _getOptions(body, {replyTo: email}));
        export const toSearchString = (date: Date) => date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
        const _checkProdMode = (actionDesc: string, subject = '', body = '', to = '') => GASton.checkProdMode([actionDesc, `Subject: ${subject}`, `Body: ${body}`, `To: ${to}`].join('\n'));

        const _getOptions = (body: string, options?: GoogleAppsScript.Gmail.GmailAdvancedOptions) => ({
            bcc: Session.getActiveUser().getEmail(),
            htmlBody: body,
            name: getNameUsedForSending(),
            ...options
        });
    }
}
