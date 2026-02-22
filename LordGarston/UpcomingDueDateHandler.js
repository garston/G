LordGarston.UpcomingDueDateHandler = class {
    doHandle(rentPayment) {
        _sendMail(rentPayment, 'Reminder: rent is due in ' + LordGarston.UpcomingDueDateHandler.REMINDER_DAYS + ' days');
    }

    shouldHandle(rentPayment) {
        return JSUtil.DateUtil.diff(_startOfToday(), rentPayment.dueDate) === LordGarston.UpcomingDueDateHandler.REMINDER_DAYS && _shouldSendMail(1);
    }
};

LordGarston.UpcomingDueDateHandler.REMINDER_DAYS = 2;
