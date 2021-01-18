GRTest.describeApp('GTxt', [
    [GTxt.Config, [0, 3030000000, GRTest.Mock.guid(GTxt.Contact, 1), '', '']],
    [GTxt.Contact, [GRTest.Mock.guid(GTxt.Contact, 1), 3030000001, 'gvKey1', 0]]
], {
    [`after:${GASton.Mail.toSearchString(new Date())} from:txt.voice.google.com in:anywhere subject:"text message" to:me`]: 'todayTxts',
    'in:inbox is:unread to:me from:txt.voice.google.com -from:13030000000.13030000001.gvKey1@txt.voice.google.com subject:"text message"': 'incomingTxts'
}, () => {
    GRTest.describeFn('go', () => {
        GRTest.it('creates Contact on txt from new number', [
            [GTxt.Config, [{}]],
            [GTxt.Contact, [{}, {number: 3030000002}]]
        ], {
            todayTxts: [
                [{ getFrom: () => '0.13030000002.gvKey2@txt.voice.google.com' }],
                [{ getFrom: () => '0.13030000003.gvKey3@txt.voice.google.com' }]
            ]
        }, GRTest.Util.expectedDbUpdatesNewRow(GTxt.Contact, 3, [3030000003, 'gvKey3', 0]));

        GRTest.it('forwards incoming txts', [
            [GTxt.Config, [{forwardToPhysicalPhone: 1}]],
            [GTxt.Contact, [{}, {guid: GRTest.Mock.guid(GTxt.Contact, 2), number: 3030000002}]]
        ], {
            incomingTxts: [
                [{
                    getFrom: () => '0.13030000002.gvKey2@txt.voice.google.com',
                    getPlainBody: () => '\n\ntxt msg\nTo respond to this text message, reply to this email or visit Google Voice.',
                    getSubject: () => 'New text message from (303) 000-0002',
                    isInInbox: () => true,
                    isUnread: () => true
                }]
            ]
        }, [
            [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, GRTest.Mock.guid(GTxt.Contact, 2)],
            [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Contact, 2, 4, 1],
            [GASton.UPDATE_TYPES.MAIL.SEND, '13030000000.13030000001.gvKey1@txt.voice.google.com', `3030000002(1!)|${new Date().getHours()}:${new Date().getMinutes()}-txt msg`],
            [GASton.UPDATE_TYPES.MAIL.MARK_READ, 'incomingTxts', 0, 0],
            [GASton.UPDATE_TYPES.MAIL.ADD_LABEL, 'incomingTxts', 0, '_SPREADSHEET_NAME']
        ]);

        GRTest.it('clears quick reply contact when forwarding disabled', [
            [GTxt.Config, [{quickReplyContactGuid: GRTest.Mock.guid(GTxt.Contact, 1)}]],
            [GTxt.Contact, [{}]]
        ], {}, [
            [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, '']
        ]);
    });
});
