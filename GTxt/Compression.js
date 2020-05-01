GTxt.Compression = {};

GTxt.Compression.compress = function(str){
    return str.
        split(' ').
        map(function(word){ return JSUtil.StringUtil.capitalize(word); }).
        join('');
};

GTxt.Compression.decompress = function(str) {
    return str.split('').map(function(ch, i, str){
        var prevCh = str[i - 1];
        if(/[.!?]/.test(prevCh) || (!/[\d:;]/.test(prevCh) && /[\d:;]/.test(ch))){
            return ' ' + ch;
        } else if(prevCh && /[A-Z]/.test(ch)){
            return ' ' + ch.toLowerCase();
        }
        return ch;
    }).join('');
};

GTxt.Compression.isCompressed = function(str){ return !str.includes(' '); };
