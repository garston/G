function notifyAmountsEntered(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    var isEditingAmount = (row >= CONST.AMOUNT_ROWS.START) && (row <= CONST.AMOUNT_ROWS.END) && (col > CONST.HEADER_COL);
    if(isEditingAmount){
        var allAmountsEntered = ArrayUtil.every(ArrayUtil.range(CONST.AMOUNT_ROWS.START, CONST.AMOUNT_ROWS.END + 1), function(row){
            return _getCellValue(row, col) !== '';
        });

        if(allAmountsEntered){
            var rentersToNotify = ArrayUtil.filter(CONST.RENTERS, function(renter){
                return renter.notifyAmountsEntered && !_hasPaid(renter, col);
            });
            ArrayUtil.forEach(rentersToNotify, function(renter){
                _sendMail(renter,
                    renter.amountRow ?
                    'Amount due for ' + DateUtil.toPrettyString(_getDueDate(col)) + ' rent is $' + _getAmountDue(renter, col) :
                    'All amounts for rent due on ' + DateUtil.toPrettyString(_getDueDate(col)) + ' are now in the spreadsheet'
                );
            });
        }
    }
}

function hourly(){
    var handlers = [
        new HasPaidHandler(),
        new RecentPaymentInMailHandler(CONST.LORD_PAYPAL_EMAIL, 'Paypal'),
        new RecentPaymentInMailHandler(CONST.LORD_BANK_EMAIL, 'mobile'),
        new UpcomingDueDateHandler(),
        new LatePaymentHandler()
    ];

    ArrayUtil.forEach(ArrayUtil.range(CONST.HEADER_COL + 1, _getSheet(CONST.SUMMARY_SHEET_NAME).getLastColumn() + 1), function(col){
        var dueDate = _getDueDate(col);
        ArrayUtil.forEach(CONST.RENTERS, function(renter){
            var handlerOptions = {
                col: col,
                dueDate: dueDate,
                renter: renter
            };
            var handler = ArrayUtil.find(handlers, function(handler){ return handler.shouldHandle(handlerOptions); });
            if(handler) {
                handler.doHandle(handlerOptions);
            }
        });
    });
}

function notifyDeposit(e){
    var row = e.range.rowStart;
    var col = e.range.columnStart;

    var depositedRenter = ArrayUtil.find(CONST.RENTERS, function(renter){
        return row === renter.depositRow && col > CONST.HEADER_COL &&
            _getCellValue(row, col).toLowerCase() === CONST.COMPLETED_VALUE.toLowerCase();
    });
    if(depositedRenter){
        _sendMail(depositedRenter, 'Your rent check due on ' + DateUtil.toPrettyString(_getDueDate(col)) + ' has been deposited');
        _getCell(row, col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
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
    return _getSheet(CONST.SUMMARY_SHEET_NAME).getRange(row, col);
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
    MailApp.sendEmail(CONST.PROD_MODE ? renter.email : CONST.LORD_EMAIL, subject, SpreadsheetApp.getActiveSpreadsheet().getUrl(), {
        name: SpreadsheetApp.getActiveSpreadsheet().getName(),
        cc: CONST.LORD_EMAIL,
        bcc: sendTxt && renter.txt,
        replyTo: CONST.LORD_EMAIL
    });
}

function _startOfToday() {
    return DateUtil.startOfDay(new Date());
}
