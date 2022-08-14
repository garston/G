GRTest.describeApp('Dialup', {
    ['in:inbox']: 'inbox',
    ['from:voice-noreply@google.com in:inbox subject:"missed call from Home"']: 'missedCalls'
}, () => {
    GRTest.describeFn('doGet', () => {
        GRTest.it('renders 0 when not enabled', [], {}, [], {'': ['0']});

        GRTest.it('renders inbox', [], {
            inbox: [[
                {getBody: () => 'b1', getFrom: () => 'email', getSubject: () => 's1', isUnread: () => false},
                {getBody: () => 'b2', getFrom: () => 'f l <email>', isUnread: () => true}
            ]],
            missedCalls: [[{isInInbox: () => false}, {isInInbox: () => true}]]
        }, [], {
            td: ['email', 'b1', GRTest.Util.nowStr, 'f l', 'b2', GRTest.Util.nowStr],
            th: ['', 's1', '']
        });
    });
});
