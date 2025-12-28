GRTest.describeApp('GTxt', {
    incomingTxts: `in:inbox is:unread to:me from:${GASton.Voice.TXT_DOMAIN} -from:${GRTest.Util.emailTxtEmail(1)} subject:"${GASton.Voice.TXT_SUBJECT}"`,
    incomingVMs: `in:inbox is:unread to:me from:${GASton.Voice.NO_REPLY_EMAIL} subject:${GASton.Voice.VOICEMAIL_SUBJECT}`,
    outgoingTxts: `in:inbox is:unread to:me from:${GRTest.Util.emailTxtEmail(1)} subject:"${GASton.Voice.TXT_SUBJECT}"`,
    todayTxts: `after:${GASton.Mail.toSearchString(new Date())} from:${GASton.Voice.TXT_DOMAIN} in:anywhere subject:"${GASton.Voice.TXT_SUBJECT}" to:me`
}, () => {
    GRTest.describeFn('go', () => {
        const contactName = 'Contact Name';

        const createEmailTxt = (i, txt) => emailInboxUnread(GRTest.Util.emailTxtCreate(i, txt));
        const createEmailVM = (subjectFrom, txt) => emailInboxUnread(GRTest.Util.emailVMCreate(subjectFrom, txt));
        const createModelConfig = (o = {}) => [GTxt.Config, [[o.disableForwarding ? 0 : 1, GRTest.Util.phoneNum(0), 1, o.quickReplyContactGuid || '', '']]];
        const createModelsContact = shortId => [GTxt.Contact, JSUtil.ArrayUtil.range(2).map(i => [i + 1, GRTest.Util.phoneNum(i + 1), GRTest.Util.gvKey(i + 1), (i && shortId) || 0])];
        const emailInboxUnread = (email, inboxUnread = true) => ({ ...email, isInInbox: () => inboxUnread, isUnread: () => inboxUnread });

        const expectedMailMsgUpdatesSend = (queryName, threadIndex, msgIndex) => [
            [GASton.UPDATE_TYPES.MAIL.MARK_READ, queryName, threadIndex, msgIndex],
            [GASton.UPDATE_TYPES.MAIL.ADD_LABEL, queryName, threadIndex, `_${GRTest.SPREADSHEET_NAME}`]
        ];

        [GRTest.Util.phoneNum(2), '303-000-0002', '+1 (303) 000-0002', -1, 1].forEach(n =>
            GRTest.it(`sends outgoing text to number formatted as ${n}`,
                [createModelConfig(), createModelsContact([-1, 1].includes(n) ? n : 0)],
                { outgoingTxts: [[createEmailTxt(1, `${n}|${GRTest.Util.DEFAULT_TXT}`)]] }, [
                    [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.Util.emailTxtEmail(2), '', GRTest.Util.DEFAULT_TXT],
                    ...expectedMailMsgUpdatesSend('outgoingTxts', 0, 0),
                    [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, 2]
                ]));

        GRTest.it('does nothing when no incoming texts', [createModelConfig(), createModelsContact()], {}, []);

        GRTest.it('creates Contact on txt (in anywhere) from new number',
            [createModelConfig(), createModelsContact()],
            { todayTxts: [[emailInboxUnread(createEmailTxt(2), false)], [emailInboxUnread(createEmailTxt(3), false)]] },
            GRTest.Util.expectedDbUpdatesNewRow(GTxt.Contact, 3, [GRTest.Util.phoneNum(3), GRTest.Util.gvKey(3), 0]));

        GRTest.it('sets quick reply contact on incoming txt',
            [createModelConfig(), createModelsContact()],
            {incomingTxts: [[createEmailTxt(2)]]}, [
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, 2],
                [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Contact, 2, 4, 1],
                [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.Util.emailTxtEmail(1), '', `${GRTest.Util.phoneNum(2)}(1!)|${JSUtil.DateUtil.timeString(new Date())}-${GRTest.Util.DEFAULT_TXT}`],
                ...expectedMailMsgUpdatesSend('incomingTxts', 0, 0)
            ]);

        [
            { desc: 'txts', emailBody: `${GRTest.Util.phoneNum(3)}|${JSUtil.DateUtil.timeString(new Date())}-${GRTest.Util.DEFAULT_TXT}`, threadsByQuery: {incomingTxts: [[createEmailTxt(3)]]} },
            { desc: 'VMs', emailBody: `${contactName}|${JSUtil.DateUtil.timeString(new Date())},VM-${GRTest.Util.DEFAULT_VM}`, threadsByQuery: {incomingVMs: [[createEmailVM(contactName)]]} }
        ].forEach(o =>
            GRTest.it(`forwards incoming ${o.desc}`,
                [createModelConfig(), createModelsContact()],
                o.threadsByQuery, [
                    [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.Util.emailTxtEmail(1), '', o.emailBody],
                    ...expectedMailMsgUpdatesSend(Object.keys(o.threadsByQuery)[0], 0, 0)
                ]));

        GRTest.it('forwards incoming empty VMs from known numbers',
            [createModelConfig(), createModelsContact()],
            {incomingVMs: [[createEmailVM(contactName, '')]]},
            [
                [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.Util.emailTxtEmail(1), '', `${contactName}|${JSUtil.DateUtil.timeString(new Date())},VM`],
                ...expectedMailMsgUpdatesSend('incomingVMs', 0, 0)
            ]);

        GRTest.it('forwards incoming empty VMs from unknown number w/ other msgs to forward',
            [createModelConfig(), createModelsContact()],
            {
                incomingTxts: [[createEmailTxt(1234567)]],
                incomingVMs: [[createEmailVM(GRTest.Util.phoneNumStr(1234567), '')]]
            },
            [
                [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.Util.emailTxtEmail(1), '', `${GRTest.Util.phoneNum(1234567)}|${JSUtil.DateUtil.timeString(new Date())}-${GRTest.Util.DEFAULT_TXT}||${GRTest.Util.phoneNum(1234567)}|${JSUtil.DateUtil.timeString(new Date())},VM`],
                ...expectedMailMsgUpdatesSend('incomingTxts', 0, 0),
                ...expectedMailMsgUpdatesSend('incomingVMs', 0, 0)
            ]);

        GRTest.it('does not forward incoming empty VMs from unknown number w/o other msgs to forward',
            [createModelConfig(), createModelsContact()],
            {incomingVMs: [[createEmailVM(GRTest.Util.phoneNumStr(1234567), '')]]},
            []);

        GRTest.it('clears quick reply contact when forwarding disabled',
            [createModelConfig({disableForwarding: true, quickReplyContactGuid: 2}), createModelsContact()], {},
            [[GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, '']]);
    });
});
