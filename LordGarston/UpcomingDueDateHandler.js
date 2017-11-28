LordGarston.UpcomingDueDateHandler = function() {};

LordGarston.UpcomingDueDateHandler.REMINDER_DAYS = 2;

LordGarston.UpcomingDueDateHandler.prototype.doHandle = function(rentPayment) {
    _sendMail(rentPayment, 'Reminder: rent is due in ' + LordGarston.UpcomingDueDateHandler.REMINDER_DAYS + ' days');
};

LordGarston.UpcomingDueDateHandler.prototype.shouldHandle = function(rentPayment) {
    return JSUtil.DateUtil.diff(_startOfToday(), rentPayment.dueDate, 'DAYS') === LordGarston.UpcomingDueDateHandler.REMINDER_DAYS && _shouldSendMail(1);
};
