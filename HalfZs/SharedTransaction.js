HalfZs.SharedTransaction = function(month, year, what, iPayed, percentOwed) {
    this.month = month;
    this.year = year;
    this.what = what;
    this.iPayed = iPayed;
    this.percentOwed = percentOwed;
};

HalfZs.SharedTransaction.__tableName = function(){ return HalfZs.Const.SHARED_TRANSACTION_TABLE_NAME; };
HalfZs.SharedTransaction.__firstRow = 2;
HalfZs.SharedTransaction.__props = ['month', 'year', 'what', null, 'iPayed', 'percentOwed'];
