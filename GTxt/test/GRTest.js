GRTest.Mock.defaultValuesByModel = [
    [GTxt.Config, [0, 3030000000, GRTest.Mock.guid(GTxt.Contact, 0), '', '']],
    [GTxt.Contact, [GRTest.Mock.guid(GTxt.Contact, 0), 3030000001, 'gvKey0', 0]]
];

GRTest.describe('go', () => {
    GRTest.it('clears quick reply contact when forwarding disabled', [
        [GTxt.Config, [{quickReplyContactGuid: GRTest.Mock.guid(GTxt.Contact, 1)}]],
        [GTxt.Contact, [{}]]
    ], {}, [
        [GTxt.Config, 1, 4, '']
    ]);
});
