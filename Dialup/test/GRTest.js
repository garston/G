GRTest.describeApp('Dialup', {
    inbox: 'in:inbox',
    missedCalls: 'from:voice-noreply@google.com in:inbox subject:"missed call from Home"'
}, () => {
    GRTest.describeFn('doGet', () => {
        const expectedTableTextContents = () => ({...expectedTdTextContents(), ...expectedThTextContents()});
        const expectedTdTextContents = ({body = msg.getPlainBody(), from = msg.getFrom(), id = 'inbox_0_0'} = {}) => ({td: [from, body, JSUtil.DateUtil.timeString(new Date()), id]});
        const expectedThTextContents = (subject = msg.getSubject()) => ({th: ['', subject, '', '']});
        const htmlToEscape = '<http://gmail.com>';
        const msg = {getFrom: () => 'f1 <email>', getPlainBody: () => 'b1', getSubject: () => 's1', isUnread: () => false};
        const threadsByQuery = {
           inbox: [[msg]],
           missedCalls: [[{isInInbox: () => false}, {isInInbox: () => true}]]
        };

        GRTest.it('renders 0 when not enabled', [], {}, [], {}, {'': ['0']});

        GRTest.it('renders multiple messages in a thread', [], {
            ...threadsByQuery,
            inbox: [[msg, {...msg, getFrom: () => 'f2', getPlainBody: () => 'b2'}]]
        }, [], {}, {
            ...expectedTableTextContents(),
            td: [...expectedTdTextContents().td, ...expectedTdTextContents({body: 'b2', from: 'f2', id: 'inbox_0_1'}).td],
        });

        GRTest.it('HTML encodes message body', [], {
            ...threadsByQuery,
            inbox: [[{...msg, getPlainBody: () => htmlToEscape}]]
        }, [], {}, expectedTdTextContents({body: htmlToEscape}));

        GRTest.it('HTML encodes message subject', [], {
            ...threadsByQuery,
            inbox: [[{...msg, getSubject: () => htmlToEscape}]]
        }, [], {}, expectedThTextContents(htmlToEscape));

        GRTest.it('renders dividers between threads', [], {
            ...threadsByQuery, inbox: [[msg], [msg]]
        }, [], {}, {'hr': ['']});

        GRTest.it('action=a replies all', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.REPLY_ALL, 'inbox', 0, 0, 'b']
        ], {action: 'a', body: 'b', id: 'inbox_0_0'}, expectedTableTextContents());

        GRTest.it('action=c sends message', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.SEND, 't', 's', 'b']
        ], {action: 'c', body: 'b', subject: 's', to: 't'}, expectedTableTextContents());

        GRTest.it('action=r replies', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.REPLY, 'inbox', 0, 0, 'b']
        ], {action: 'r', body: 'b', id: 'inbox_0_0'}, expectedTableTextContents());

        GRTest.it('action=invalid returns error', [], threadsByQuery, [], {action: 'g'}, {'': ["invalid action 'g'"]});

        GRTest.it('q param searches messages', [], {
            ...threadsByQuery,
            'g': [[{...msg, getSubject: () => 's'}]]
        }, [], {q: 'g'}, expectedThTextContents('s'));
    });
});
