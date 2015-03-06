LordGarston.LatePaymentHandler = function() {};

LordGarston.LatePaymentHandler.prototype.doHandle = function(rentPayment) {
    _sendMail(rentPayment, 'Rent due on ' + JSUtil.DateUtil.toPrettyString(rentPayment.dueDate) + ' hasn\'t been received', true);
};

LordGarston.LatePaymentHandler.prototype.shouldHandle = function(rentPayment) {
    return _startOfToday() > rentPayment.dueDate &&
        _shouldSendMail(rentPayment.getRenter().increaseNotificationsForEveryLateDay ? JSUtil.DateUtil.dayDiff(rentPayment.dueDate, _startOfToday()) : 1)
};
