HalfZs.SharedTransaction = function(month, year, what, iPayed, percentOwed) {
    this.month = month;
    this.year = year;
    this.what = what;
    this.iPayed = iPayed;
    this.percentOwed = percentOwed;
};

HalfZs.SharedTransaction.__tableName = 'SHARED_TRANSACTIONS';
HalfZs.SharedTransaction.__firstRow = 2;
HalfZs.SharedTransaction.__props = ['month', 'year', 'what', null, 'iPayed', 'percentOwed'];
