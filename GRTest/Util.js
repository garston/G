GRTest.Util = {};

GRTest.Util.DEFAULT_TXT = 'txt msg';
GRTest.Util.DEFAULT_VM = 'VM msg';

GRTest.Util.emailTxtBody = (txt = GRTest.Util.DEFAULT_TXT) => `\n\n${txt}\nTo respond to this text message, reply to this email or visit Google Voice.`;

GRTest.Util.emailTxtCreate = (i = 0, txt) => ({
    getFrom: () => GRTest.Util.emailTxtEmail(i),
    getPlainBody: () => GRTest.Util.emailTxtBody(txt),
    getSubject: () => `New ${GASton.Voice.TXT_SUBJECT} from ${GRTest.Util.phoneNumStr(i)}`
});

GRTest.Util.emailTxtEmail = (i = 0) => `1${GRTest.Util.phoneNum(0)}.1${(GRTest.Util.phoneNum(i))}.${GRTest.Util.gvKey(i)}@${GASton.Voice.TXT_DOMAIN}`;

GRTest.Util.emailVMCreate = (subjectFrom, vm = GRTest.Util.DEFAULT_VM) => ({
    getFrom: () => GASton.Voice.NO_REPLY_EMAIL,
    getPlainBody: () => `\n\n${vm}\nplay message`,
    getSubject: () => `New ${GASton.Voice.VOICEMAIL_SUBJECT} from ${subjectFrom}`
});

GRTest.Util.expectedDbUpdatesNewRow = (model, rowNum, values) => [
    [GASton.UPDATE_TYPES.DB.INSERT, model],
    ...values.map((val, i) => [GASton.UPDATE_TYPES.DB.UPDATE, model, rowNum, i + 2, val])
];

GRTest.Util.gvKey = i => `gvKey${i}`;

GRTest.Util.phoneNum = i => 3030000000 + i;
GRTest.Util.phoneNumStr = i => {
    const chars = `${GRTest.Util.phoneNum(i)}`.split('');
    const parts = [chars.slice(0, 3), chars.slice(3, 6), chars.slice(6)].map(a => a.join(''));
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
};
