Dialup = {};

function doGet(req) {
    new GASton.ExecutionLog(req.parameter);

    return ContentService.createTextOutput(
        JSUtil.ArrayUtil.sum(GmailApp.search('from:voice-noreply@google.com in:inbox subject:"missed call from Home"').map(t => t.getMessages().filter(m => m.isInInbox()).length)) % 2 ?
        Dialup.RequestHandler.handle(req.parameter) :
        '0'
    );
}
