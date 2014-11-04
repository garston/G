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
                if(_hasNotPaid(renter, col)){
                    var subject = renter.amountRow ?
                        'Amount due for ' + _prettyDate(_getDueDate(col)) + ' rent is $' + _getCellValue(renter.amountRow, col).toFixed(2) :
                        'All amounts for rent due on ' + _prettyDate(_getDueDate(col)) + ' are now in the spreadsheet';
                    _sendMail(renter, subject);
                }
            }
        }
    }
}

function hourly(e){
    var today = new Date();

    for(var col = CONST.HEADER_COL + 1; col <= _getSheet(CONST.SUMMARY_SHEET_NAME).getLastColumn(); col++){
        var dueDate = _getDueDate(col);
        var prettyDueDate = _prettyDate(dueDate);
        var reminderDay = _addDays(-CONST.REMINDER_DAYS, dueDate);

        for(var i = 0; i < CONST.RENTERS.length; i++){
            var renter = CONST.RENTERS[i];
            if(_hasNotPaid(renter, col)){
                if(_hasPaidWithPayPal(renter, col)){
                    _getCell(renter.paidRow, col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
                    _getCell(renter.depositRow, col).setValue('Paypal');
                    _sendMail(renter, 'Paypal payment recieved for ' + prettyDueDate + ' rent check, thank you');
                } else {
                    var daysLate = today.getDate() - dueDate.getDate();
                    if(today > dueDate && _shouldSendMail(daysLate + 1)){
                        var lateMessage = 'Rent due on ' + prettyDueDate + ' hasn\'t been recieved';
                        _sendMail(renter, lateMessage, true);
                    }else if(today > reminderDay && today < _addDays(1, reminderDay) && _shouldSendMail(1)){
                        _sendMail(renter, 'Reminder: rent is due in ' + CONST.REMINDER_DAYS + ' days');
                    }
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
            _sendMail(renter, 'Your rent check due on ' + _prettyDate(_getDueDate(col)) + ' has been deposited');
            _getCell(row, col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
            SpreadsheetApp.flush();
        }
    }
}


function _hasPaidWithPayPal(renter, col){
    var date = _addDays(-4, _getDueDate(col));
    var searchDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();

    var threads = GmailApp.search('to:' + CONST.LORD_PAYPAL_EMAIL + ' ' + renter.email + ' after:' + searchDate, 0, 1);
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
    return _addDays(1, _getCellValue(1, col));
}

function _addDays(days, date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function _prettyDate(ts){
    return (ts.getMonth()+1) + '/' + ts.getDate() + '/' + ts.getFullYear();
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
