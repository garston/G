GRTest.describe('go', () => {
    GRTest.it('clears quick reply contact when forwarding disabled', [
        [GTxt.Config, [[0, 3030000000, `${GTxt.Contact.__tableName}0`, `${GTxt.Contact.__tableName}1`, '']]],
        [GTxt.Contact, [[`${GTxt.Contact.__tableName}0`, 3030000001, 'gvKey0', 0]]]
    ], {}, [
        [GTxt.Config, 1, 4, '']
    ]);
});
