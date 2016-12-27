GTxt = {};

function go() {
    var config = GASton.Database.hydrate(GTxt.Config)[0];
    GTxt.MissedCallEnabler.changeEnabled(config);

    if(config.isEnabled) {
        GTxt.MonkeyInTheMiddle.forwardTexts(config);
    }
}
