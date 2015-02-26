HalfZs = {};

function checkChaseTransactions() {
    var processedStrings = [];
    var notProcessedStrings = [];

    JSUtil.ArrayUtil.forEach(GmailApp.search('label:' + HalfZs.Const.CHASE_LABEL), function(thread){
        JSUtil.ArrayUtil.forEach(thread.getMessages(), function(message){
            if(!message.isInTrash()){
                var transactionInfo = /([0-9]+[.][0-9][0-9]) at (.+) has been authorized on 0?([0-9]+)[/][0-9]+[/]([0-9]+)/.exec(message.getPlainBody());
                var amount = transactionInfo[1];
                var chaseFullName = transactionInfo[2];
                var month = transactionInfo[3];
                var year = transactionInfo[4];

                var sharingInfo = JSUtil.ArrayUtil.find(HalfZs.Const.SHARING_INFOS, function(sharingInfo){
                    return JSUtil.StringUtil.contains(chaseFullName.toLowerCase(), (sharingInfo.chaseName || sharingInfo.prettyName).toLowerCase());
                });
                if(sharingInfo){
                    var sharedTransaction = GASton.Database.hydrateBy(HalfZs.SharedTransaction, ['month', '']);
                    sharedTransaction.month = month;
                    sharedTransaction.year = year;
                    sharedTransaction.what = sharingInfo.prettyName;
                    sharedTransaction.iPayed = amount;
                    sharedTransaction.percentOwed = sharingInfo.splitPercent;
                    GASton.Database.persist(HalfZs.SharedTransaction, sharedTransaction);

                    processedStrings.push([month, year, sharingInfo.prettyName, '$' + amount, sharingInfo.splitPercent + '%'].join(' '));
                }else{
                    notProcessedStrings.push([month, year, chaseFullName, '$' + amount].join(' '));
                }

                message.moveToTrash();
            }
        });
    });

    if(processedStrings.length || notProcessedStrings.length){
        GASton.MailSender.sendToIndividual('HalfZs ' + JSUtil.DateUtil.toPrettyString(new Date()), [
            'Processed:', processedStrings.join('<br/>'), '<br/>', 'Not Processed:', notProcessedStrings.join('<br/>')
        ].join('<br/>'), Session.getActiveUser().getEmail());
    }
}
