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

                var sharingInfo = _findSharingInfo(chaseFullName, sharingInfos);
                if(sharingInfo){
                    _newSharedTransaction(month, year, amount, sharingInfo, processedStrings);
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
        _newSharedTransaction(
            now.getMonth() + 1, now.getFullYear(),
            /Amount Due: [$]([0-9]+[.][0-9][0-9])/.exec(xcelThread.getMessages()[0].getBody())[1],
            _findSharingInfo('Xcel', sharingInfos), processedStrings
        );
    }

    if(processedStrings.length || notProcessedStrings.length){
        GASton.MailSender.sendToIndividual('HalfZs ' + JSUtil.DateUtil.toPrettyString(now), [
            'Processed:', processedStrings.join('<br/>'), '<br/>', 'Not Processed:', notProcessedStrings.join('<br/>')
        ].join('<br/>'), Session.getActiveUser().getEmail());
    }
}

function _findSharingInfo(name, sharingInfos) {
    return JSUtil.ArrayUtil.find(sharingInfos, function (sharingInfo) {
        return JSUtil.StringUtil.contains(name.toLowerCase(), (sharingInfo.chaseName || sharingInfo.prettyName).toLowerCase());
    });
}

function _newSharedTransaction(month, year, iPayed, sharingInfo, processedStrings) {
    var sharedTransaction = GASton.Database.hydrateBy(HalfZs.SharedTransaction, ['month', '']);
    sharedTransaction.month = month;
    sharedTransaction.year = year;
    sharedTransaction.what = sharingInfo.prettyName;
    sharedTransaction.iPayed = iPayed;
    sharedTransaction.percentOwed = sharingInfo.splitPercent;
    GASton.Database.persist(HalfZs.SharedTransaction, sharedTransaction);

    processedStrings.push([month, year, sharingInfo.prettyName, '$' + iPayed, sharingInfo.splitPercent + '%'].join(' '));
}
