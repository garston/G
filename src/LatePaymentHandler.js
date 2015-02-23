LordGarston.LatePaymentHandler = function() {};

LordGarston.LatePaymentHandler.prototype.doHandle = function(options) {
    _sendMail(options.renter, 'Rent due on ' + JSUtil.DateUtil.toPrettyString(options.dueDate) + ' hasn\'t been received', true);
};

LordGarston.LatePaymentHandler.prototype.shouldHandle = function(options) {
    return _startOfToday() > options.dueDate && _shouldSendMail(options.renter.increaseNotificationsForEveryLateDay ? JSUtil.DateUtil.dayDiff(options.dueDate, _startOfToday()) : 1)
};
