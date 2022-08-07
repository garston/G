Dialup = {};

function doGet() {
    return ContentService.createTextOutput(Dialup.MailRenderer.generateHtml().join(''));
}
