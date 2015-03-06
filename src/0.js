LordGarston = {};

function hourly(){
    var handlers = [
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_PAYPAL_EMAIL, 'Paypal'),
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_BANK_EMAIL, 'mobile'),
        new LordGarston.UpcomingDueDateHandler(),
        new LordGarston.LatePaymentHandler()
    ];

    JSUtil.ArrayUtil.forEach(GASton.Database.hydrateAllBy(LordGarston.RentPayment, ['paidWith', '']), function(rentPayment){
        var handler = JSUtil.ArrayUtil.find(handlers, function(handler){ return handler.shouldHandle(rentPayment); });
        if(handler) {
            handler.doHandle(rentPayment);
        }
    });
}

function _shouldSendMail(timesPerDay){
    var startHour = 7;
    return (new Date().getHours() - startHour) % (Math.ceil(24 / timesPerDay)) === 0;
}

function _sendMail(rentPayment, subject, sendTxt){
    var renter = rentPayment.getRenter();
    GASton.MailSender.sendToIndividual(subject, SpreadsheetApp.getActiveSpreadsheet().getUrl(), renter.email + (sendTxt && renter.txt ? ',' + renter.txt : ''));
}

function _startOfToday() {
    return JSUtil.DateUtil.startOfDay(new Date());
}
