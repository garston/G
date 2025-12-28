GASton.Voice = {};
GASton.Voice.GROUP_TXT_SUBJECT = 'group message';
GASton.Voice.MISSED_CALL_SUBJECT = 'missed call';
GASton.Voice.NO_REPLY_EMAIL = 'voice-noreply@google.com';
GASton.Voice.TXT_DOMAIN = 'txt.voice.google.com';
GASton.Voice.TXT_SUBJECT = 'text message';
GASton.Voice.VOICEMAIL_SUBJECT = 'voicemail';

GASton.Voice.getFirstNumberMentioned = str => +JSUtil.StringUtil.matchSafe(str, /\((\d+)\) (\d+)-(\d+)/).slice(1).join('');


GASton.Voice.getMessageBody = (message, lineJoiner = ' ') => {
    const lines = message.getPlainBody().split('\n').map(line => line.trim());
    const endIndex = lines.findIndex(line =>
        ['To respond to this text message, reply to this email or visit Google Voice.', 'play message'].includes(line) ||
        line.startsWith('YOUR ACCOUNT ')
    );
    return endIndex < 0 ? '' : lines.slice(2, endIndex).join(lineJoiner);
};

GASton.Voice.getTxtEmail = (gvNumber, number, gvKey) => `1${gvNumber}.${number.toString().length === 10 ? 1 : ''}${number}.${gvKey}@${GASton.Voice.TXT_DOMAIN}`;

GASton.Voice.parseFromTxt = message => {
    const match = JSUtil.StringUtil.matchSafe(GASton.Mail.parseFrom(message).email, /^\d+\.1?(\d+)\.(.+)@/);
    return { gvKey: match[2], number: +match[1] };
};
