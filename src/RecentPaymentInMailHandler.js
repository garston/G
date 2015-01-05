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
        GmailApp.search(_getAmountDue(options.renter, options.col) + ' to:' + this.toEmail + ' after:' + this._getSearchDate(options.col), 0, 1).length > 0;
};

RecentPaymentInMailHandler.prototype._getSearchDate = function(col) {
    var date = DateUtil.addDays(-4, _getDueDate(col));
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
};
