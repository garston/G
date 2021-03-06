GTxt.ContactPopulator = {};

GTxt.ContactPopulator.execute = function(noDateLimitation) {
    GmailApp.search((noDateLimitation ? '' : 'after:' + GASton.Mail.toSearchString(new Date()) + ' ') + 'from:' + GTxt.Voice.TXT_DOMAIN + ' in:anywhere subject:' + GTxt.Voice.TXT_SUBJECT + ' to:me').
        map(function(thread){ return GTxt.Voice.parseFromTxt(thread.getMessages()[0]); }).
        forEach(function(fromParts){
            if(!GTxt.Contact.findByNumber(fromParts.number)){
                new GTxt.Contact(fromParts.number, fromParts.gvKey);
            }
        });
};
