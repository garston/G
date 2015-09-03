LordGarston.RecentPaymentInMailHandler = function(toEmail, depositRowDisplayValue) {
    this.toEmail = toEmail;
    this.depositRowDisplayValue = depositRowDisplayValue;
};

LordGarston.RecentPaymentInMailHandler.prototype.doHandle = function(rentPayment) {
    rentPayment.paidWith = this.depositRowDisplayValue;
    GASton.Database.persistOnly(LordGarston.RentPayment, rentPayment, ['paidWith']);
};

LordGarston.RecentPaymentInMailHandler.prototype.shouldHandle = function(rentPayment) {
    return GmailApp.search(Math.floor(rentPayment.totalAmount) +
            ' to:' + this.toEmail +
            ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, new Date())),
            0, 1).length > 0;
};
