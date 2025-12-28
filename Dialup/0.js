Dialup = {};

function doGet(req) {
    new GASton.ExecutionLog(req.parameter);

    return ContentService.createTextOutput(
        JSUtil.ArrayUtil.sum(GmailApp.search(`from:${GASton.Voice.NO_REPLY_EMAIL} in:inbox subject:"${GASton.Voice.MISSED_CALL_SUBJECT} from Home"`).map(t => t.getMessages().filter(m => m.isInInbox()).length)) % 2 ?
        Dialup.RequestHandler.handle(req.parameter) :
        '0'
    );
}
