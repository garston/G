function notifyAmountsEntered(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    var isEditingAmount = (row >= CONST.AMOUNT_ROWS.START) && (row <= CONST.AMOUNT_ROWS.END) && (col > CONST.HEADER_COL);
    if(isEditingAmount){
        var allAmountsEntered = true;
        for(var r = CONST.AMOUNT_ROWS.START; r <= CONST.AMOUNT_ROWS.END; r++){
            if(_getCellValue(r, col) === ''){
                allAmountsEntered = false;
                break;
            }
        }

        if(allAmountsEntered){
            for(var i = 0; i < CONST.RENTERS.length; i++){
                var renter = CONST.RENTERS[i];
                if(renter.notifyAmountsEntered && _hasNotPaid(renter, col)){
                    var subject = renter.amountRow ?
                        'Amount due for ' + DateUtil.prettyDate(_getDueDate(col)) + ' rent is $' + _getCellValue(renter.amountRow, col).toFixed(2) :
                        'All amounts for rent due on ' + DateUtil.prettyDate(_getDueDate(col)) + ' are now in the spreadsheet';
                    _sendMail(renter, subject);
                }
            }
        }
    }
}

function hourly(){
    var today = DateUtil.startOfDay(new Date());

    for(var col = CONST.HEADER_COL + 1; col <= _getSheet(CONST.SUMMARY_SHEET_NAME).getLastColumn(); col++){
        var dueDate = _getDueDate(col);
        var prettyDueDate = DateUtil.prettyDate(dueDate);
        var reminderDays = 2;
        var reminderDay = DateUtil.addDays(-reminderDays, dueDate);

        for(var i = 0; i < CONST.RENTERS.length; i++){
            var renter = CONST.RENTERS[i];
            if(_hasNotPaid(renter, col)){
                if(_hasPaidWithPayPal(renter, col)){
                    _getCell(renter.paidRow, col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
                    _getCell(renter.depositRow, col).setValue('Paypal');
                    _sendMail(renter, 'Paypal payment received for ' + prettyDueDate + ' rent check, thank you');
                } else if(today > dueDate && _shouldSendMail(renter.increaseNotificationsForEveryLateDay ? DateUtil.dayDiff(dueDate, today) : 1)) {
                    _sendMail(renter, 'Rent due on ' + prettyDueDate + ' hasn\'t been received', true);
                } else if(DateUtil.dayDiff(reminderDay, today) === 0 && _shouldSendMail(1)) {
                    _sendMail(renter, 'Reminder: rent is due in ' + reminderDays + ' days');
                }
            }
        }
    }
}

function notifyDeposit(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    for(var i = 0; i < CONST.RENTERS.length; i++){
        var renter = CONST.RENTERS[i];
        if((row === renter.depositRow) && col > CONST.HEADER_COL && _getCellValue(row, col).toLowerCase() === CONST.COMPLETED_VALUE.toLowerCase()){
            _sendMail(renter, 'Your rent check due on ' + DateUtil.prettyDate(_getDueDate(col)) + ' has been deposited');
            _getCell(row, col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
            SpreadsheetApp.flush();
        }
    }
}


function _hasPaidWithPayPal(renter, col){
    var date = DateUtil.addDays(-4, _getDueDate(col));
    var searchDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();

    var threads = GmailApp.search(renter.email + ' to:' + CONST.LORD_PAYPAL_EMAIL + ' after:' + searchDate, 0, 1);
    return threads.length > 0;
}

function _hasNotPaid(renter, col){
    return _getCellValue(renter.paidRow, col) === '';
}

function _getSheet(sheetName) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
}

function _getCell(row, col){
    return _getSheet(CONST.SUMMARY_SHEET_NAME).getRange(row, col);
}

function _getCellValue(row, col){
    return _getCell(row, col).getValue();
}

function _getDueDate(col){
    return _getCellValue(1, col);
}

function _shouldSendMail(timesPerDay){
    var startHour = 7;
    return (new Date().getHours() - startHour) % (Math.ceil(24 / timesPerDay)) === 0;
}

function _sendMail(renter, subject, sendTxt){
    MailApp.sendEmail(CONST.PROD_MODE ? renter.email : CONST.LORD_EMAIL, subject, SpreadsheetApp.getActiveSpreadsheet().getUrl(), {
        name: SpreadsheetApp.getActiveSpreadsheet().getName(),
        cc: CONST.LORD_EMAIL,
        bcc: sendTxt && renter.txt,
        replyTo: CONST.LORD_EMAIL
    });
}
