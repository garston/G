UpcomingDueDateHandler = function() {};

UpcomingDueDateHandler.REMINDER_DAYS = 2;

UpcomingDueDateHandler.prototype.doHandle = function(options) {
    _sendMail(options.renter, 'Reminder: rent is due in ' + UpcomingDueDateHandler.REMINDER_DAYS + ' days');
};

UpcomingDueDateHandler.prototype.shouldHandle = function(options) {
    return DateUtil.dayDiff(_startOfToday(), options.dueDate) === UpcomingDueDateHandler.REMINDER_DAYS && _shouldSendMail(1);
};
