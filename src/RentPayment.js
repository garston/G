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

LordGarston.RentPayment.__tableName = 'Rent payments';
LordGarston.RentPayment.__firstRow = 2;
LordGarston.RentPayment.__propsToCol = {
    dueDate: 1,
    renterName: 2,
    baseAmount: 3,
    additionalAmount: 4,
    totalAmount: 5,
    paidWith: 6
};
