HalfZs = {};

function processTransactions() {
    var processedStrings = [];
    var notProcessedStrings = [];

    var sharingInfos = GASton.Database.hydrateAll(HalfZs.SharingInfo);
    JSUtil.ArrayUtil.forEach(GmailApp.search('label:' + HalfZs.Const.CHASE_LABEL), function(thread){
        JSUtil.ArrayUtil.forEach(thread.getMessages(), function(message){
            if(!message.isInTrash()){
                var transactionInfo = /([0-9]+[.][0-9][0-9]) at (.+) has been authorized on 0?([0-9]+)[/][0-9]+[/]([0-9]+)/.exec(message.getPlainBody());
                var amount = transactionInfo[1];
                var chaseFullName = transactionInfo[2];
                var month = transactionInfo[3];
                var year = transactionInfo[4];

                var sharingInfo = JSUtil.ArrayUtil.find(sharingInfos, function(sharingInfo){
                    return JSUtil.StringUtil.contains(chaseFullName.toLowerCase(), (sharingInfo.chaseName || sharingInfo.prettyName).toLowerCase());
                });
                if(sharingInfo){
                    processedStrings.push(_populateNextEmptySharedTransactionAndPersist(month, year, sharingInfo.prettyName, amount, sharingInfo.splitPercent));
                }else{
                    notProcessedStrings.push([month, year, chaseFullName, '$' + amount].join(' '));
                }

                message.moveToTrash();
            }
        });
    });

    var now = new Date();
    var xcelThread = GmailApp.search('subject:"' + HalfZs.Const.XCEL_SUBJECT + '" after:' + JSUtil.DateUtil.toSearchString(now))[0];
    if(xcelThread) {
        processedStrings.push(_populateNextEmptySharedTransactionAndPersist(
            now.getMonth() + 1, now.getFullYear(), 'Xcel', /Amount Due: [$]([0-9]+[.][0-9][0-9])/.exec(xcelThread.getMessages()[0].getBody())[1], 50
        ));
    }

    if(processedStrings.length || notProcessedStrings.length){
        GASton.MailSender.sendToIndividual('HalfZs ' + JSUtil.DateUtil.toPrettyString(now), [
            'Processed:', processedStrings.join('<br/>'), '<br/>', 'Not Processed:', notProcessedStrings.join('<br/>')
        ].join('<br/>'), Session.getActiveUser().getEmail());
    }
}

function _populateNextEmptySharedTransactionAndPersist(month, year, what, iPayed, percentOwed) {
    var sharedTransaction = GASton.Database.hydrateBy(HalfZs.SharedTransaction, ['month', '']);
    sharedTransaction.month = month;
    sharedTransaction.year = year;
    sharedTransaction.what = what;
    sharedTransaction.iPayed = iPayed;
    sharedTransaction.percentOwed = percentOwed;
    GASton.Database.persist(HalfZs.SharedTransaction, sharedTransaction);

    return [month, year, what, '$' + iPayed, percentOwed + '%'].join(' ');
}
