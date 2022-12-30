GRTest.describeApp('Dialup', {
    inbox: 'in:inbox',
    missedCalls: 'from:voice-noreply@google.com in:inbox subject:"missed call from Home"'
}, () => {
    GRTest.describeFn('doGet', () => {
        const expectedTableTextContents = () => ({...expectedTdTextContents(), ...expectedThTextContents()});
        const expectedTdTextContents = ({body = msg.getPlainBody(), from = msg.getFrom(), id = 'inbox_0_0'} = {}) => ({td: [from, body, JSUtil.DateUtil.timeString(new Date()), id]});
        const expectedThTextContents = ({id = 'inbox_0', subject = msg.getSubject()} = {}) => ({th: ['', subject, '', id]});
        const testQueryRendersMessage = (desc, q, message) => GRTest.it(desc, [], threadsByQuery([[message]], q), [], {q}, expectedThTextContents({id: `${q}_0`}));
        const threadsByQuery = (threads = [[msg]], q = 'inbox') => ({
            missedCalls: [[{isInInbox: () => false}, {isInInbox: () => true}]],
            [q]: threads
        });

        const htmlToEscape = '<g><t>';
        const msg = {getFrom: () => 'f1 <email>', getPlainBody: () => 'b1', getSubject: () => 's1'};
        const msgDeleted = {...msg, isInTrash: () => true};
        const msgOld = {...msg, getDate: () => JSUtil.DateUtil.addDays(-1, new Date())};

        GRTest.it('renders 0 when not enabled', [], {}, [], {}, {'': ['0']});

        GRTest.it('renders metadata', [], threadsByQuery([[msg], [msg]]), [], {}, {'body > div': [null, 'Thread IDs: inbox_0,inbox_1']});

        GRTest.it('filters deleted messages', [], threadsByQuery([[msg, msgDeleted], [msgDeleted]]), [], {}, expectedTableTextContents());

        ['anywhere', 'trash'].forEach(scope => testQueryRendersMessage(`doesn't filter deleted messages when querying ${scope}`, `in:${scope}`, msgDeleted));

        GRTest.it('renders multiple messages in a thread', [],
            threadsByQuery([[msg, {...msg, getFrom: () => 'f2', getPlainBody: () => 'b2'}]]), [], {}, {
                ...expectedTableTextContents(),
                td: [...expectedTdTextContents().td, ...expectedTdTextContents({body: 'b2', from: 'f2', id: 'inbox_0_1'}).td],
            });

        GRTest.it('HTML encodes message body', [],
            threadsByQuery([[{...msg, getPlainBody: () => htmlToEscape}]]), [], {}, expectedTdTextContents({body: htmlToEscape}));

        GRTest.it('HTML encodes message subject', [],
            threadsByQuery([[{...msg, getSubject: () => htmlToEscape}]]), [], {}, expectedThTextContents({subject: htmlToEscape}));

        GRTest.it('renders dividers between threads', [], threadsByQuery([[msg], [msg]]), [], {}, {hr: ['', '']});

        GRTest.it('action=a replies all', [], threadsByQuery(), [
            [GASton.UPDATE_TYPES.MAIL.REPLY_ALL, 'inbox', 0, 0, 'b']
        ], {action: 'a', body: 'b', id: 'inbox_0_0'}, expectedTableTextContents());

        GRTest.it('action=c sends message', [], threadsByQuery(), [
            [GASton.UPDATE_TYPES.MAIL.SEND, 't', 's', 'b']
        ], {action: 'c', body: 'b', subject: 's', to: 't'}, expectedTableTextContents());

        GRTest.it('action=d moves to trash', [], threadsByQuery(), [
            [GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, 'inbox', 0],
            [GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, 'inbox', 0, 0]
        ], {action: 'd', ids: 'inbox_0,inbox_0_0'}, expectedTableTextContents());

        GRTest.it('action=r replies', [], threadsByQuery(), [
            [GASton.UPDATE_TYPES.MAIL.REPLY, 'inbox', 0, 0, 'b']
        ], {action: 'r', body: 'b', id: 'inbox_0_0'}, expectedTableTextContents());

        GRTest.it('action=invalid returns error', [], threadsByQuery(), [], {action: 'g'}, {'': ["invalid action 'g'"]});

        GRTest.it('"after" param filters by date', [],
            threadsByQuery([[msgOld, {...msg, getSubject: () => 's2'}], [msgOld]]), [], {after: `${Date.now() - 1}`}, {
                ...expectedTableTextContents(),
                td: expectedTdTextContents({id: 'inbox_0_1'}).td
            });

        GRTest.it('"bodyLength" param restricts body length', [], threadsByQuery(), [], {bodyLength: '1'}, expectedTdTextContents({body: 'b'}));

        testQueryRendersMessage('"q" param searches messages', 'g', msg);
    });
});
