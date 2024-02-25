GRTest.describeApp('GASton', {}, () => {
    GRTest.describeFn('emailLog', () => {
        GRTest.it('does nothing when log empty', [], {}, []);

        GRTest.it('sends email & deletes log', [
            [GASton.ExecutionLog, ['a', 'b'].map(c => [JSUtil.GuidUtil.generate(), Date.now(), c])],
        ], {}, [
            [GASton.UPDATE_TYPES.MAIL.SEND, GRTest.ACTIVE_USER_EMAIL, GRTest.SPREADSHEET_NAME, ['a', 'b'].map(c => `${JSUtil.DateUtil.timeString(new Date())} ${c}`).join('')],
            [GASton.UPDATE_TYPES.DB.CLEAR, GASton.ExecutionLog]
        ]);
    });
});
