RecentPaymentInMailHandler = function(toEmail, depositRowDisplayValue) {
    this.toEmail = toEmail;
    this.depositRowDisplayValue = depositRowDisplayValue;
};

RecentPaymentInMailHandler.prototype.doHandle = function(options) {
    _getCell(options.renter.paidRow, options.col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
    _getCell(options.renter.depositRow, options.col).setValue(this.depositRowDisplayValue);
};

RecentPaymentInMailHandler.prototype.shouldHandle = function(options) {
    return options.renter.amountRow &&
        GmailApp.search(_getAmountDue(options.renter, options.col) +
            ' to:' + this.toEmail +
            ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, new Date())),
            0, 1).length > 0;
};
