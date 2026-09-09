namespace GASton {
    export namespace Voice {
        export const GROUP_TXT_SUBJECT = 'group message';
        export const MISSED_CALL_SUBJECT = 'missed call';
        export const NO_REPLY_EMAIL = 'voice-noreply@google.com';
        export const TXT_DOMAIN = 'txt.voice.google.com';
        export const TXT_SUBJECT = 'text message';
        export const VOICEMAIL_SUBJECT = 'voicemail';

        export const getFirstNumberMentioned = (s: string) => +JSUtil.StringUtil.matchSafe(s, /\((\d+)\) (\d+)-(\d+)/).slice(1).join('');

        export const getMessageBody = (message: GoogleAppsScript.Gmail.GmailMessage, lineJoiner = ' ') => {
            const lines = message.getPlainBody().split('\n').map(line => line.trim());
            const endIndex = lines.findIndex(line =>
                ['To respond to this text message, reply to this email or visit Google Voice.', 'play message'].includes(line) ||
                line.startsWith('YOUR ACCOUNT ')
            );
            return endIndex < 0 ? '' : lines.slice(2, endIndex).join(lineJoiner);
        };

        export const getTxtEmail = (gvNumber: number, number: number, gvKey: string) => `1${gvNumber}.${number.toString().length === 10 ? 1 : ''}${number}.${gvKey}@${GASton.Voice.TXT_DOMAIN}`;

        export const parseFromTxt = (message:GoogleAppsScript.Gmail.GmailMessage) => {
            const match = JSUtil.StringUtil.matchSafe(GASton.Mail.parseFrom(message).email, /^\d+\.1?(\d+)\.(.+)@/);
            return { gvKey: match[2], number: +match[1] };
        };
    }
}
