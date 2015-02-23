LordGarston = {};

function notifyAmountsEntered(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    var isEditingAmount = (row >= LordGarston.Const.AMOUNT_ROWS.START) && (row <= LordGarston.Const.AMOUNT_ROWS.END) && (col > LordGarston.Const.HEADER_COL);
    if(isEditingAmount){
        var allAmountsEntered = JSUtil.ArrayUtil.every(JSUtil.ArrayUtil.range(LordGarston.Const.AMOUNT_ROWS.START, LordGarston.Const.AMOUNT_ROWS.END + 1), function(row){
            return _getCellValue(row, col) !== '';
        });

        if(allAmountsEntered){
            var rentersToNotify = JSUtil.ArrayUtil.filter(LordGarston.Const.RENTERS, function(renter){
                return renter.notifyAmountsEntered && !_hasPaid(renter, col);
            });
            JSUtil.ArrayUtil.forEach(rentersToNotify, function(renter){
                _sendMail(renter,
                    renter.amountRow ?
                    'Amount due for ' + JSUtil.DateUtil.toPrettyString(_getDueDate(col)) + ' rent is $' + _getAmountDue(renter, col) :
                    'All amounts for rent due on ' + JSUtil.DateUtil.toPrettyString(_getDueDate(col)) + ' are now in the spreadsheet'
                );
            });
        }
    }
}

function hourly(){
    var handlers = [
        new LordGarston.HasPaidHandler(),
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_PAYPAL_EMAIL, 'Paypal'),
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_BANK_EMAIL, 'mobile'),
        new LordGarston.UpcomingDueDateHandler(),
        new LordGarston.LatePaymentHandler()
    ];

    JSUtil.ArrayUtil.forEach(JSUtil.ArrayUtil.range(LordGarston.Const.HEADER_COL + 1, _getSheet(LordGarston.Const.SUMMARY_SHEET_NAME).getLastColumn() + 1), function(col){
        var dueDate = _getDueDate(col);
        JSUtil.ArrayUtil.forEach(LordGarston.Const.RENTERS, function(renter){
            var handlerOptions = {
                col: col,
                dueDate: dueDate,
                renter: renter
            };
            var handler = JSUtil.ArrayUtil.find(handlers, function(handler){ return handler.shouldHandle(handlerOptions); });
            if(handler) {
                handler.doHandle(handlerOptions);
            }
        });
    });
}

function notifyDeposit(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    var depositedRenter = JSUtil.ArrayUtil.find(LordGarston.Const.RENTERS, function(renter){
        return row === renter.depositRow && col > LordGarston.Const.HEADER_COL &&
            _getCellValue(row, col).toLowerCase() === LordGarston.Const.COMPLETED_VALUE.toLowerCase();
    });
    if(depositedRenter){
        _sendMail(depositedRenter, 'Your rent check due on ' + JSUtil.DateUtil.toPrettyString(_getDueDate(col)) + ' has been deposited');
        _getCell(row, col).setValue(LordGarston.Const.COMPLETED_DISPLAY_VALUE);
        SpreadsheetApp.flush();
    }
}


function _hasPaid(renter, col) {
    return _getCellValue(renter.paidRow, col) !== '';
}

function _getSheet(sheetName) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
}

function _getCell(row, col){
    return _getSheet(LordGarston.Const.SUMMARY_SHEET_NAME).getRange(row, col);
}

function _getCellValue(row, col){
    return _getCell(row, col).getValue();
}

function _getAmountDue(renter, col) {
    return _getCellValue(renter.amountRow, col).toFixed(2);
}

function _getDueDate(col){
    return _getCellValue(1, col);
}

function _shouldSendMail(timesPerDay){
    var startHour = 7;
    return (new Date().getHours() - startHour) % (Math.ceil(24 / timesPerDay)) === 0;
}

function _sendMail(renter, subject, sendTxt){
    MailApp.sendEmail(LordGarston.Const.PROD_MODE ? renter.email : LordGarston.Const.LORD_EMAIL, subject, SpreadsheetApp.getActiveSpreadsheet().getUrl(), {
        name: SpreadsheetApp.getActiveSpreadsheet().getName(),
        cc: LordGarston.Const.LORD_EMAIL,
        bcc: sendTxt && renter.txt,
        replyTo: LordGarston.Const.LORD_EMAIL
    });
}

function _startOfToday() {
    return JSUtil.DateUtil.startOfDay(new Date());
}
