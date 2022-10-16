GRTest.describeApp('GASton', {}, () => {
    GRTest.describeFn('emailLog', () => {
        GRTest.it('does nothing when log empty', [], {}, []);

        GRTest.it('sends email & deletes log', [
            [GASton.ExecutionLog, ['a', 'b'].map(c => [JSUtil.GuidUtil.generate(), JSUtil.DateUtil.timeString(new Date()), c])],
        ], {}, [
            [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.ACTIVE_USER_EMAIL, GRTest.SPREADSHEET_NAME, ['a', 'b'].map(c => `${JSUtil.DateUtil.timeString(new Date())} ${c}`).join('')],
            ...JSUtil.ArrayUtil.range(2).map(() => [GASton.UPDATE_TYPES.DB.DELETE, GASton.ExecutionLog, 1])
        ]);
    });
});
