GTxt.ContactPopulator = {};

GTxt.ContactPopulator.execute = function(noDateLimitation) {
    GmailApp.search((noDateLimitation ? '' : 'after:' + JSUtil.DateUtil.toSearchString(new Date()) + ' ') + 'from:' + GASton.Voice.TXT_DOMAIN + ' in:anywhere subject:' + GASton.Voice.TXT_SUBJECT).
        map(function(thread){ return GASton.Voice.parseFromTxt(thread.getMessages()[0]); }).
        forEach(function(fromParts){
            if(!GASton.Database.findBy(GTxt.Contact, 'number', fromParts.number)){
                GASton.Database.persist(GTxt.Contact, new GTxt.Contact(fromParts.number, fromParts.gvKey));
            }
        });
};
