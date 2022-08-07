const gvKey = i => `gvKey${i}`;
const phoneNum = i => 3030000000 + i;
const txtEmail = i => `1${phoneNum(0)}.1${(phoneNum(i))}.${gvKey(i)}@txt.voice.google.com`;

GRTest.describeApp('GTxt', {
    [`in:inbox is:unread to:me from:txt.voice.google.com -from:${txtEmail(1)} subject:"text message"`]: 'incomingTxts',
    'in:inbox is:unread to:me from:voice-noreply@google.com subject:voicemail': 'incomingVMs',
    [`in:inbox is:unread to:me from:${txtEmail(1)} subject:"text message"`]: 'outgoingTxts',
    [`after:${GASton.Mail.toSearchString(new Date())} from:txt.voice.google.com in:anywhere subject:"text message" to:me`]: 'todayTxts'
}, () => {
    GRTest.describeFn('go', () => {
        const contactName = 'Contact Name';
        const defaultTxt = 'txt msg';
        const defaultVM = 'VM msg';

        const createEmailTxt = (i, txt = defaultTxt) => emailInboxUnread({
            getFrom: () => txtEmail(i),
            getPlainBody: () => `\n\n${txt}\nTo respond to this text message, reply to this email or visit Google Voice.`,
            getSubject: () => `New text message from ${phoneNumStr(i)}`,
        });

        const createEmailVM = (subjectFrom, txt = defaultVM) => emailInboxUnread({
            getPlainBody: () => `\n\n${txt}\nplay message`,
            getSubject: () => `New voicemail from ${subjectFrom}`,
        });

        const createModelConfig = (o = {}) => [GTxt.Config, [[o.disableForwarding ? 0 : 1, phoneNum(0), 1, o.quickReplyContactGuid || '', '']]];
        const createModelsContact = shortId => [GTxt.Contact, JSUtil.ArrayUtil.range(2).map(i => [i + 1, phoneNum(i + 1), gvKey(i + 1), (i && shortId) || 0])];
        const emailInboxUnread = (email, inboxUnread = true) => ({ ...email, isInInbox: () => inboxUnread, isUnread: () => inboxUnread });

        const expectedMailMsgUpdatesSend = (queryName, threadIndex, msgIndex) => [
            [GASton.UPDATE_TYPES.MAIL.MARK_READ, queryName, threadIndex, msgIndex],
            [GASton.UPDATE_TYPES.MAIL.ADD_LABEL, queryName, threadIndex, `_${GRTest.SPREADSHEET_NAME}`]
        ];

        const phoneNumStr = i => {
            const chars = `${phoneNum(i)}`.split('');
            const parts = [chars.slice(0, 3), chars.slice(3, 6), chars.slice(6)].map(a => a.join(''));
            return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
        };

        [phoneNum(2), '303-000-0002', '+1 (303) 000-0002', -1, 1].forEach(n =>
            GRTest.it(`sends outgoing text to number formatted as ${n}`,
                [createModelConfig(), createModelsContact([-1, 1].includes(n) ? n : 0)],
                { outgoingTxts: [[createEmailTxt(1, `${n}|${defaultTxt}`)]] }, [
                    [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(2), defaultTxt],
                    ...expectedMailMsgUpdatesSend('outgoingTxts', 0, 0),
                    [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, 2]
                ]));

        GRTest.it('does nothing when no incoming texts', [createModelConfig(), createModelsContact()], {}, []);

        GRTest.it('creates Contact on txt (in anywhere) from new number',
            [createModelConfig(), createModelsContact()],
            { todayTxts: [[emailInboxUnread(createEmailTxt(2), false)], [emailInboxUnread(createEmailTxt(3), false)]] },
            GRTest.Util.expectedDbUpdatesNewRow(GTxt.Contact, 3, [phoneNum(3), gvKey(3), 0]));

        GRTest.it('sets quick reply contact on incoming txt',
            [createModelConfig(), createModelsContact()],
            {incomingTxts: [[createEmailTxt(2)]]}, [
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, 2],
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Contact, 2, 4, 1],
                [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(1), `${phoneNum(2)}(1!)|${GRTest.Util.nowStr}-${defaultTxt}`],
                ...expectedMailMsgUpdatesSend('incomingTxts', 0, 0)
            ]);

        [
            { desc: 'txts', emailBody: `${phoneNum(3)}|${GRTest.Util.nowStr}-${defaultTxt}`, threadsByQuery: {incomingTxts: [[createEmailTxt(3)]]} },
            { desc: 'VMs', emailBody: `${contactName}|${GRTest.Util.nowStr},VM-${defaultVM}`, threadsByQuery: {incomingVMs: [[createEmailVM(contactName)]]} }
        ].forEach(o =>
            GRTest.it(`forwards incoming ${o.desc}`,
                [createModelConfig(), createModelsContact()],
                o.threadsByQuery, [
                    [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(1), o.emailBody],
                    ...expectedMailMsgUpdatesSend(Object.keys(o.threadsByQuery)[0], 0, 0)
                ]));

        GRTest.it('forwards incoming empty VMs from known numbers',
            [createModelConfig(), createModelsContact()],
            {incomingVMs: [[createEmailVM(contactName, '')]]},
            [
                [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(1), `${contactName}|${GRTest.Util.nowStr},VM`],
                ...expectedMailMsgUpdatesSend('incomingVMs', 0, 0)
            ]);

        GRTest.it('forwards incoming empty VMs from unknown number w/ other msgs to forward',
            [createModelConfig(), createModelsContact()],
            {
                incomingTxts: [[createEmailTxt(1234567)]],
                incomingVMs: [[createEmailVM(phoneNumStr(1234567), '')]]
            },
            [
                [GASton.UPDATE_TYPES.MAIL.SEND, txtEmail(1), `${phoneNum(1234567)}|${GRTest.Util.nowStr}-${defaultTxt}||${phoneNum(1234567)}|${GRTest.Util.nowStr},VM`],
                ...expectedMailMsgUpdatesSend('incomingTxts', 0, 0),
                ...expectedMailMsgUpdatesSend('incomingVMs', 0, 0)
            ]);

        GRTest.it('does not forward incoming empty VMs from unknown number w/o other msgs to forward',
            [createModelConfig(), createModelsContact()],
            {incomingVMs: [[createEmailVM(phoneNumStr(1234567), '')]]},
            []);

        GRTest.it('clears quick reply contact when forwarding disabled',
            [createModelConfig({disableForwarding: true, quickReplyContactGuid: 2}), createModelsContact()], {},
            [[GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, '']]);
    });
});
