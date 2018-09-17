GTxt = {};
GTxt.DOUBLE_SEPARATOR = '||';
GTxt.SEPARATOR = '|';

function clearShortIds () {
    GTxt.Contact.allWithShortId().forEach(function(c){
        c.shortId = 0;
    });
}

function doGet() {
    return ContentService.createTextOutput(GTxt.Config.soleInstance().toggleForwardToPhysicalPhone().toString());
}

function go() {
    GTxt.ContactPopulator.execute();

    var config = GTxt.Config.soleInstance();
    GTxt.MissedCallEnabler.changeEnabled(config);
    GTxt.MonkeyInTheMiddle.forwardTexts(config);
    GTxt.SenderMonkey.sendTextsFromEmails(config);
}

function populateContacts() {
    GTxt.ContactPopulator.execute(true);
}

