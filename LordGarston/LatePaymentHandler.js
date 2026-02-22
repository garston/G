LordGarston.LatePaymentHandler = class {
    doHandle(rentPayment) {
        _sendMail(rentPayment, 'Rent due on ' + JSUtil.DateUtil.toPrettyString(rentPayment.dueDate) + ' hasn\'t been received', true);
    }

    shouldHandle(rentPayment) {
        return _startOfToday() > rentPayment.dueDate && rentPayment.getRenter().shouldSendLatePaymentEmail(JSUtil.DateUtil.diff(rentPayment.dueDate, _startOfToday()));
    }
};