LordGarston.RentPayment = function(dueDate, renterName, baseAmount, additionalAmount, totalAmount, paidWith) {
    this.dueDate = dueDate;
    this.renterName = renterName;
    this.baseAmount = baseAmount;
    this.additionalAmount = additionalAmount;
    this.totalAmount = totalAmount;
    this.paidWith = paidWith;
};

LordGarston.RentPayment.prototype.getRenter = function() {
    return JSUtil.ArrayUtil.find(LordGarston.Const.RENTERS, function(renter){
        return renter.name === this.renterName;
    }, this);
};

GASton.Database.register(LordGarston.RentPayment, 'Rent payments', ['dueDate', 'renterName', 'baseAmount', 'additionalAmount', 'totalAmount', 'paidWith'], true);
