RecentPaypalPaymentHandler = function() {};

RecentPaypalPaymentHandler.prototype.doHandle = function(options) {
    _getCell(options.renter.paidRow, options.col).setValue(CONST.COMPLETED_DISPLAY_VALUE);
    _getCell(options.renter.depositRow, options.col).setValue('Paypal');
};

RecentPaypalPaymentHandler.prototype.shouldHandle = function(options) {
    var date = DateUtil.addDays(-4, _getDueDate(options.col));
    var searchDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();

    var threads = GmailApp.search(options.renter.email + ' to:' + CONST.LORD_PAYPAL_EMAIL + ' after:' + searchDate, 0, 1);
    return threads.length > 0;
};
