namespace GRTest {
    export namespace Util {
        export const DEFAULT_TXT = 'txt msg';
        export const DEFAULT_VM = 'VM msg';

        export const emailTxtBody = (txt = DEFAULT_TXT) => `\n\n${txt}\nTo respond to this text message, reply to this email or visit Google Voice.`;

        export const emailTxtCreate = (i = 0, txt?: string) => ({
            getFrom: () => emailTxtEmail(i),
            getPlainBody: () => emailTxtBody(txt),
            getSubject: () => `New ${GASton.Voice.TXT_SUBJECT} from ${phoneNumStr(i)}`
        } as GoogleAppsScript.Gmail.GmailMessage);

        export const emailTxtEmail = (i = 0) => `1${phoneNum(0)}.1${(phoneNum(i))}.${gvKey(i)}@${GASton.Voice.TXT_DOMAIN}`;

        export const emailVMCreate = (subjectFrom = '', vm = DEFAULT_VM) => ({
            getFrom: () => GASton.Voice.NO_REPLY_EMAIL,
            getPlainBody: () => `\n\n${vm}\nplay message`,
            getSubject: () => `New ${GASton.Voice.VOICEMAIL_SUBJECT} from ${subjectFrom}`
        } as GoogleAppsScript.Gmail.GmailMessage);

        export const expectedDbUpdatesNewRow = (model: GASton.Database.RegisteredClass, rowNum: number, values: GRTest.UpdateValue[]) => [
            [GASton.UPDATE_TYPES.DB.INSERT, model] as ExpectedUpdate,
            ...values.map((val, i) => [GASton.UPDATE_TYPES.DB.UPDATE, model, rowNum, i + 2, val] as ExpectedUpdate)
        ];

        export const gvKey = (i: number) => `gvKey${i}`;

        export const phoneNum = (i: number) => 3030000000 + i;
        export const phoneNumStr = (i: number) => {
            const chars = `${phoneNum(i)}`.split('');
            const parts = [chars.slice(0, 3), chars.slice(3, 6), chars.slice(6)].map(a => a.join(''));
            return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
        };
    }
}
