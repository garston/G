GRTest.describeApp('GTxt', [
    [GTxt.Config, [0, 3030000000, GRTest.Mock.guid(GTxt.Contact, 0), '', '']],
    [GTxt.Contact, [GRTest.Mock.guid(GTxt.Contact, 0), 3030000000, 'gvKey0', 0]]
], () => {
    GRTest.describeFn('go', () => {
        GRTest.it('creates Contact on txt from new number', [
            [GTxt.Config, [{}]],
            [GTxt.Contact, [{}, {number: 3030000001}]]
        ], {
            [`after:${GASton.Mail.toSearchString(new Date())} from:txt.voice.google.com in:anywhere subject:"text message" to:me`]: [
                [{ from: `0.13030000001.gvKey1@${GTxt.Voice.TXT_DOMAIN}` }],
                [{ from: `0.13030000002.gvKey2@${GTxt.Voice.TXT_DOMAIN}` }]
            ]
        }, GRTest.Util.expectedDbUpdatesNewRow(GTxt.Contact, 3, [3030000002, 'gvKey2', 0]));

        GRTest.it('clears quick reply contact when forwarding disabled', [
            [GTxt.Config, [{quickReplyContactGuid: GRTest.Mock.guid(GTxt.Contact, 1)}]],
            [GTxt.Contact, [{}]]
        ], {}, [
            [GASton.UPDATE_TYPES.DB.UPDATE, GTxt.Config, 1, 4, '']
        ]);
    });
});
