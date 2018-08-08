HalfZs.SharedTransaction = function(month, year, what, iPayed, percentOwed) {
    this.month = month;
    this.year = year;
    this.what = what;
    this.iPayed = iPayed;
    this.percentOwed = percentOwed;
};

GASton.Database.register(HalfZs.SharedTransaction, 'SHARED_TRANSACTIONS', ['month', 'year', 'what', null, 'iPayed', 'percentOwed'], true);
