const gvKey = i => `gvKey${i}`;
const phoneNum = i => 3030000000 + i;
const txtEmail = i => `1${phoneNum(0)}.1${(phoneNum(i))}.${gvKey(i)}@txt.voice.google.com`;

GRTest.describeApp('GTxt', {
    [`after:${GASton.Mail.toSearchString(new Date())} from:txt.voice.google.com in:anywhere subject:"text message" to:me`]: 'todayTxts',
    [`in:inbox is:unread to:me from:txt.voice.google.com -from:${txtEmail(1)} subject:"text message"`]: 'incomingTxts'
}, () => {
    const createEmailTxt = (i, txt) => ({
        getFrom: () => txtEmail(i),
        getPlainBody: () => `\n\n${txt}\nTo respond to this text message, reply to this email or visit Google Voice.`,
        getSubject: () => `New text message from ${phoneNumStr(i)}`,
    });

    const createModelConfig = (o = {}) => [GTxt.Config, [[o.disableForwarding ? 0 : 1, phoneNum(0), 1, o.quickReplyContactGuid || '', '']]];
    const createModelsContact = () => [GTxt.Contact, JSUtil.ArrayUtil.range(2).map(i => [i + 1, phoneNum(i + 1), gvKey(i + 1), 0])];

    const phoneNumStr = i => {
        const chars = `${phoneNum(i)}`.split('');
        return `(${chars.slice(0, 3).join('')}} ${chars.slice(3, 3).join('')}-${chars.slice(6).join('')}`;
    };

    GRTest.describeFn('go', () => {
        GRTest.it('creates Contact on txt (in anywhere) from new number',
            [createModelConfig(), createModelsContact()],
            { todayTxts: [[createEmailTxt(2)], [createEmailTxt(3)]]},
            GRTest.Util.expectedDbUpdatesNewRow(GTxt.Contact, 3, [phoneNum(3), gvKey(3), 0]));

        GRTest.it('forwards incoming txts',
            [createModelConfig(), createModelsContact()],
            {incomingTxts: [[{...createEmailTxt(2, 'txt msg'), isInInbox: () => true, isUnread: () => true}]]}, [
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, 2],
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Contact, 2, 4, 1],
                [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(1), `${phoneNum(2)}(1!)|${new Date().getHours()}:${new Date().getMinutes()}-txt msg`],
                [GASton.UPDATE_TYPES.MAIL.MARK_READ, 'incomingTxts', 0, 0],
                [GASton.UPDATE_TYPES.MAIL.ADD_LABEL, 'incomingTxts', 0, `_${SpreadsheetApp.getActiveSpreadsheet().getName()}`]
        ]);

        GRTest.it('clears quick reply contact when forwarding disabled',
            [createModelConfig({disableForwarding: true, quickReplyContactGuid: 2}), createModelsContact()], {},
            [[GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, '']]);
    });
});
