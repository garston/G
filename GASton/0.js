GASton = {};
GASton.checkProdMode = function(str, values) {
    return true;
    Logger.log.apply(Logger, [str].concat(values || []));
};
