HalfZs = {};

function checkChaseTransactions() {
    JSUtil.ArrayUtil.forEach(GmailApp.search('label:' + HalfZs.Const.CHASE_LABEL), function(thread){
        JSUtil.ArrayUtil.forEach(thread.getMessages(), function(message){
            if(!message.isInTrash()){
                var transactionInfo = /([0-9]+[.][0-9][0-9]) at (.+) has been authorized on 0?([0-9]+)[/][0-9]+[/]([0-9]+)/.exec(message.getPlainBody());

                var sharingInfo = JSUtil.ArrayUtil.find(HalfZs.Const.SHARING_INFOS, function(sharingInfo){
                    return JSUtil.StringUtil.contains(transactionInfo[2].toLowerCase(), (sharingInfo.chaseName || sharingInfo.prettyName).toLowerCase());
                });
                if(sharingInfo){
                    var sharedTransaction = GASton.Database.hydrateBy(HalfZs.SharedTransaction, ['month', '']);
                    sharedTransaction.month = transactionInfo[3];
                    sharedTransaction.year = transactionInfo[4];
                    sharedTransaction.what = sharingInfo.prettyName;
                    sharedTransaction.iPayed = transactionInfo[1];
                    sharedTransaction.percentOwed = sharingInfo.splitPercent;
                    GASton.Database.persist(HalfZs.SharedTransaction, sharedTransaction);

                    message.moveToTrash();
                }
            }
        });
    });
}
