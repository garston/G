LatePaymentHandler = function() {};

LatePaymentHandler.prototype.doHandle = function(options) {
    _sendMail(options.renter, 'Rent due on ' + DateUtil.prettyDate(options.dueDate) + ' hasn\'t been received', true);
};

LatePaymentHandler.prototype.shouldHandle = function(options) {
    return _startOfToday() > options.dueDate && _shouldSendMail(options.renter.increaseNotificationsForEveryLateDay ? DateUtil.dayDiff(options.dueDate, _startOfToday()) : 1)
};
