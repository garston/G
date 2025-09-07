GTxt.ContactPopulator = {};

GTxt.ContactPopulator.execute = function(noDateLimitation) {
    GmailApp.search(`${noDateLimitation ? '' : `after:${GASton.Mail.toSearchString(new Date())} `}from:${GASton.Voice.TXT_DOMAIN} in:anywhere subject:${GASton.Voice.TXT_SUBJECT} to:me`).
        map(thread => GASton.Voice.parseFromTxt(thread.getMessages()[0])).
        forEach(function(fromParts){
            if(!GTxt.Contact.findByNumber(fromParts.number)){
                new GTxt.Contact(fromParts.number, fromParts.gvKey);
            }
        });
};
