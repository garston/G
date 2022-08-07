Dialup = {};

function doGet() {
    return ContentService.createTextOutput(
        JSUtil.ArrayUtil.sum(GmailApp.search('from:voice-noreply@google.com in:inbox subject:"missed call from Home"').map(t => t.getMessages().filter(m => m.isInInbox()).length)) % 2 ?
        Dialup.MailRenderer.generateHtml().join('') :
        '0'
    );
}
