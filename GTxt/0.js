GTxt = {};

function go() {
    GTxt.ContactPopulator.execute();

    var config = GASton.Database.hydrate(GTxt.Config)[0];
    GTxt.MissedCallEnabler.changeEnabled(config);
    GTxt.MonkeyInTheMiddle.forwardTexts(config);
}

function populateContacts() {
    GTxt.ContactPopulator.execute(true);
}
