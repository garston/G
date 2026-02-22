LordGarston.RecentPaymentInMailHandler = class {
    constructor(toEmail, depositRowDisplayValue) {
        this.toEmail = toEmail;
        this.depositRowDisplayValue = depositRowDisplayValue;
    }

    doHandle(rentPayment) {
        rentPayment.paidWith = this.depositRowDisplayValue;
    }

    shouldHandle(rentPayment) {
        return GmailApp.search(Math.floor(rentPayment.totalAmount) +
                ' to:' + this.toEmail +
                ' after:' + GASton.Mail.toSearchString(JSUtil.DateUtil.addDays(-1, new Date())),
                0, 1).length > 0;
    }
};
