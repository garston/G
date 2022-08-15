GRTest.describeApp('Dialup', {
    ['in:inbox']: 'inbox',
    ['from:voice-noreply@google.com in:inbox subject:"missed call from Home"']: 'missedCalls'
}, () => {
    GRTest.describeFn('doGet', () => {
        const expectedTdTextContents = ({body = msg.getPlainBody(), from = msg.getFrom()} = {}) => ({td: [from, body, GRTest.Util.nowStr]});
        const expectedThTextContents = (subject = msg.getSubject()) => ({th: ['', subject, '']});
        const missedCalls = [[{isInInbox: () => false}, {isInInbox: () => true}]];
        const msg = {getFrom: () => 'email', getPlainBody: () => 'b1', getSubject: () => 's1', isUnread: () => false};

        GRTest.it('renders 0 when not enabled', [], {}, [], {'': ['0']});

        GRTest.it('renders inbox', [], {
            inbox: [[msg, {...msg, getFrom: () => 'email2', getPlainBody: () => 'b2'}]],
            missedCalls
        }, [], {
            ...expectedThTextContents(),
            td: [...expectedTdTextContents().td, ...expectedTdTextContents({body: 'b2', from: 'email2'}).td],
        });

        GRTest.it('displays message sender first/last name when avail', [], {
            inbox: [[{...msg, getFrom: () => 'f l <email>'}]],
            missedCalls
        }, [], expectedTdTextContents({from: 'f l'}));

        GRTest.it('HTML encodes message body', [], {
            inbox: [[{...msg, getPlainBody: () => '<http://gmail.com>'}]],
            missedCalls
        }, [], expectedTdTextContents({body: '<http://gmail.com>'}));

        GRTest.it('HTML encodes message subject', [], {
            inbox: [[{...msg, getSubject: () => `'"&`}]],
            missedCalls
        }, [], expectedThTextContents(`'"&`));
    });
});
