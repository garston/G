HasPaidHandler = function(){};

HasPaidHandler.prototype.doHandle = function(options) {};

HasPaidHandler.prototype.shouldHandle = function(options) {
    return _hasPaid(options.renter, options.col);
};
