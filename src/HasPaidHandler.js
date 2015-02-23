LordGarston.HasPaidHandler = function(){};

LordGarston.HasPaidHandler.prototype.doHandle = function(options) {};

LordGarston.HasPaidHandler.prototype.shouldHandle = function(options) {
    return _hasPaid(options.renter, options.col);
};
