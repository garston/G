namespace Dialup {
    export type Parameter = {
        action?: string;
        after?: string;
        body?: string;
        bodyLength?: string;
        bodyRaw?: string;
        id?: string;
        ids?: string;
        msgIds?: string;
        q?: string;
        subject?: string;
        to?: string;
    };
}

function doGet(req: GoogleAppsScript.Events.DoGet) {
    new GASton.ExecutionLog(req.parameter);

    return ContentService.createTextOutput(
        JSUtil.ArrayUtil.sum(GmailApp.search(`from:${GASton.Voice.NO_REPLY_EMAIL} in:inbox subject:"${GASton.Voice.MISSED_CALL_SUBJECT} from Home"`).map(t => t.getMessages().filter(m => m.isInInbox()).length)) % 2 ?
        Dialup.RequestHandler.handle(req.parameter) :
        '0'
    );
}
