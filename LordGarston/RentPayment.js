LordGarston.RentPayment = class {
    constructor(dueDate, renterName, baseAmount, additionalAmount, totalAmount, paidWith) {
        this.dueDate = dueDate;
        this.renterName = renterName;
        this.baseAmount = baseAmount;
        this.additionalAmount = additionalAmount;
        this.totalAmount = totalAmount;
        this.paidWith = paidWith;
    }

    getRenter() {
        return LordGarston.Const.RENTERS.find(renter => renter.name === this.renterName);
    }
};

GASton.Database.register(LordGarston.RentPayment, 'Rent payments', ['dueDate', 'renterName', 'baseAmount', 'additionalAmount', 'totalAmount', 'paidWith'], true);
