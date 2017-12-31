LordGarston = {};

function createRentPayment(){
    LordGarston.Const.RENTERS.
        filter(function(renter){ return renter.isActive; }).
        forEach(function(renter){
            var dueDate = JSUtil.DateUtil.startOfDay(JSUtil.DateUtil.lastDayOfMonth(new Date()));
            var newRowNum = GASton.Database.hydrate(LordGarston.RentPayment).length + 1;
            GASton.Database.persist(new LordGarston.RentPayment(
                dueDate, renter.name, renter.baseAmount, renter.getAdditionalAmountValue(dueDate), '=C' + newRowNum + ' + ' + 'D' + newRowNum, ''
            ));
        });
}

function hourly(){
    var handlers = [
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_PAYPAL_EMAIL, 'Paypal'),
        new LordGarston.RecentPaymentInMailHandler(LordGarston.Const.LORD_BANK_EMAIL, 'check'),
        new LordGarston.UpcomingDueDateHandler(),
        new LordGarston.LatePaymentHandler()
    ];

    GASton.Database.hydrate(LordGarston.RentPayment).
        filter(function(rentPayment){ return rentPayment.paidWith === ''; }).
        forEach(function(rentPayment){
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
    GASton.Mail.sendToIndividual(subject, SpreadsheetApp.getActiveSpreadsheet().getUrl(), renter.email + (sendTxt && renter.txt ? ',' + renter.txt : ''));
}

function _startOfToday() {
    return JSUtil.DateUtil.startOfDay(new Date());
}
