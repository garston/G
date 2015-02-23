LordGarston.UpcomingDueDateHandler = function() {};

LordGarston.UpcomingDueDateHandler.REMINDER_DAYS = 2;

LordGarston.UpcomingDueDateHandler.prototype.doHandle = function(options) {
    _sendMail(options.renter, 'Reminder: rent is due in ' + LordGarston.UpcomingDueDateHandler.REMINDER_DAYS + ' days');
};

LordGarston.UpcomingDueDateHandler.prototype.shouldHandle = function(options) {
    return JSUtil.DateUtil.dayDiff(_startOfToday(), options.dueDate) === LordGarston.UpcomingDueDateHandler.REMINDER_DAYS && _shouldSendMail(1);
};
