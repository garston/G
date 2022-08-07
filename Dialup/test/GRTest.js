GRTest.describeApp('Dialup', {
    ['in:inbox']: 'inbox',
    ['from:voice-noreply@google.com in:inbox subject:"missed call from Home"']: 'missedCalls'
}, () => {
    GRTest.describeFn('doGet', () => {
        GRTest.it('renders 0 when not enabled', [], {}, [], '0');

        GRTest.it('renders inbox', [], {
            inbox: [[
                {getBody: () => 'b1', getFrom: () => 'email', getSubject: () => 's1', isUnread: () => false},
                {getBody: () => 'b2', getFrom: () => 'f l <email>', isUnread: () => true}
            ]],
            missedCalls: [[{isInInbox: () => false}, {isInInbox: () => true}]]
        }, [], `<table><tr><th></th><th>s1</th><th></th></tr><tr><td>email</td><td>b1</td><td>${GRTest.Util.nowStr}</td></tr><tr style="font-weight: bold"><td>f l</td><td>b2</td><td>${GRTest.Util.nowStr}</td></tr></table>`);
    });
});
