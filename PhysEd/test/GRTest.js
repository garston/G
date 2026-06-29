GRTest.describeApp('PhysEd', {}, () => {
    GRTest.describeFn('notifyGameTomorrow', () => {
        const groupMeToken = 'groupMeToken';
        const mailingListEmail = 'sport@me.com';
        const sportName = 'Sport';

        const expectedEmailSent = [GASton.UPDATE_TYPES.MAIL.SEND, mailingListEmail, `${sportName} Tomorrow!`, ''];
        const modelLeague = (gameDayDaysFromNow = 1) => [PhysEd.League, [[1, sportName, '', 2, '', '', 'option1,option2', JSUtil.DateUtil.getDay(gameDayDaysFromNow), -1]]];
        const modelMailingList = groupMe => [PhysEd.MailingList, [[2, mailingListEmail, '', '', groupMe ? groupMeToken : '', groupMe ? 3 : '', '', '', '']]];

        GRTest.it('notifies game tmrw', [modelLeague(), modelMailingList()], {}, [expectedEmailSent]);

        GRTest.it('does not notify when no game tmrw', [modelLeague(0), modelMailingList(true)], {}, []);

        GRTest.it('creates GroupMe poll when mailing list has GroupMe', [modelLeague(), modelMailingList(true)], {}, [
            expectedEmailSent,
            [GASton.UPDATE_TYPES.URL.FETCH, `https://api.groupme.com/v3/poll/3?token=${groupMeToken}`, {
                contentType: 'application/json',
                payload: JSON.stringify({
                    ...PhysEd.MailingList.createGroupMePollTmrwParams(),
                    options: [{title: 'option1'}, {title: 'option2'}],
                    type: 'single',
                    visibility: 'public'
                }),
                method: 'post'
            }]
        ]);
    });
});
