GRTest.describeApp('Dialup', {
    inbox: 'in:inbox',
    missedCalls: 'from:voice-noreply@google.com in:inbox subject:"missed call from Home"'
}, () => {
    GRTest.describeFn('doGet', () => {
        const expectedTableTextContents = () => ({...expectedTdTextContents(), ...expectedThTextContents()});
        const expectedTdTextContents = ({body = msg.getPlainBody(), from = msg.getFrom(), id = 'inbox_0_0'} = {}) => ({td: [from, body, GRTest.Util.nowStr, id]});
        const expectedThTextContents = (subject = msg.getSubject()) => ({th: ['', subject, '', '']});
        const msg = {getFrom: () => 'email', getPlainBody: () => 'b1', getSubject: () => 's1', isUnread: () => false};
        const threadsByQuery = {
           inbox: [[msg]],
           missedCalls: [[{isInInbox: () => false}, {isInInbox: () => true}]]
        };

        GRTest.it('renders 0 when not enabled', [], {}, [], GRTest.Util.createReq(), {'': ['0']});

        GRTest.it('renders multiple messages in a thread', [], {
            ...threadsByQuery,
            inbox: [[msg, {...msg, getFrom: () => 'email2', getPlainBody: () => 'b2'}]]
        }, [], GRTest.Util.createReq(), {
            ...expectedTableTextContents(),
            td: [...expectedTdTextContents().td, ...expectedTdTextContents({body: 'b2', from: 'email2', id: 'inbox_0_1'}).td],
        });

        GRTest.it('displays message sender first/last name when avail', [], {
            ...threadsByQuery,
            inbox: [[{...msg, getFrom: () => 'f l <email>'}]]
        }, [], GRTest.Util.createReq(), expectedTdTextContents({from: 'f l'}));

        GRTest.it('HTML encodes message body', [], {
            ...threadsByQuery,
            inbox: [[{...msg, getPlainBody: () => '<http://gmail.com>'}]]
        }, [], GRTest.Util.createReq(), expectedTdTextContents({body: '<http://gmail.com>'}));

        GRTest.it('HTML encodes message subject', [], {
            ...threadsByQuery,
            inbox: [[{...msg, getSubject: () => `'"&`}]]
        }, [], GRTest.Util.createReq(), expectedThTextContents(`'"&`));

        GRTest.it('renders dividers between threads', [], {
            ...threadsByQuery, inbox: [[msg], [msg]]
        }, [], GRTest.Util.createReq(), {'hr': ['']});

        GRTest.it('action=a replies all', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.REPLY_ALL, 'inbox', 0, 0, 'b']
        ], GRTest.Util.createReq({action: 'a', body: 'b', id: 'inbox_0_0'}), expectedTableTextContents());

        GRTest.it('action=c sends message', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.SEND, 't', 's', 'b']
        ], GRTest.Util.createReq({action: 'c', body: 'b', subject: 's', to: 't'}), expectedTableTextContents());

        GRTest.it('action=r replies', [], threadsByQuery, [
            [GASton.UPDATE_TYPES.MAIL.REPLY, 'inbox', 0, 0, 'b']
        ], GRTest.Util.createReq({action: 'r', body: 'b', id: 'inbox_0_0'}), expectedTableTextContents());

        GRTest.it('action=invalid returns error', [], threadsByQuery, [], GRTest.Util.createReq({action: 'g'}), {'': ["invalid action 'g'"]});

        GRTest.it('q param searches messages', [], {
            ...threadsByQuery,
            'g': [[{...msg, getSubject: () => 's'}]]
        }, [], GRTest.Util.createReq({q: 'g'}), expectedThTextContents('s'));
    });
});
