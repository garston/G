GRTest.describeApp('PhysEd', {}, () => {
    GRTest.describeFn('notifyGameTomorrow', () => {
        const mailingListEmail = 'sport@me.com';
        const sportName = 'Sport';

        const expectedEmailSent = [GASton.UPDATE_TYPES.MAIL.SEND, mailingListEmail, `${sportName} Tomorrow!`, ''];
        const modelLeagueGameTmrw = [PhysEd.League, [[1, sportName, '', 2, '', '', 'option1,option2', JSUtil.DateUtil.getDay(1), -1]]];

        GRTest.it('sends email notifying of game', [
            modelLeagueGameTmrw,
            [PhysEd.MailingList, [[2, mailingListEmail, '', '', '', '', '', '', '', '']]]
        ], {}, [expectedEmailSent]);

        GRTest.it('creates GroupMe poll when mailing list has GroupMe', [
            modelLeagueGameTmrw,
            [PhysEd.MailingList, [[2, mailingListEmail, '', '', 'groupMeToken', 3, '', '', '']]]
        ], {}, [
            expectedEmailSent,
            [GASton.UPDATE_TYPES.URL.FETCH, 'https://api.groupme.com/v3/poll/3?token=groupMeToken', {
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
