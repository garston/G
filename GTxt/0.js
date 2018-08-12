GTxt = {};
GTxt.DOUBLE_SEPARATOR = '||';
GTxt.SEPARATOR = '|';

function clearShortIds () {
    GTxt.Contact.allWithShortId().forEach(function(c){
        c.shortId = 0;
    });
}

function go() {
    GTxt.ContactPopulator.execute();

    var config = GASton.Database.hydrate(GTxt.Config)[0];
    GTxt.MissedCallEnabler.changeEnabled(config);
    GTxt.MonkeyInTheMiddle.forwardTexts(config);
    GTxt.SenderMonkey.sendTextsFromEmails(config);
}

function populateContacts() {
    GTxt.ContactPopulator.execute(true);
}

