GTxt.ReceiverMonkey = {};

GTxt.ReceiverMonkey.txtPhysicalPhone = function(msgObjs, config) {
    if(!msgObjs.length){
        return;
    }

    var origText = msgObjs.map(function(obj){ return obj.text; }).join(GTxt.DOUBLE_SEPARATOR);
    var compressedText = GTxt.Compression.compress(origText);

    GTxt.Util.mail(
        config.getPhysicalPhoneContactTxtEmail(),
        this._numTexts(compressedText) < this._numTexts(origText) ? compressedText : origText,
        JSUtil.ArrayUtil.flatten(msgObjs.map(function(o){ return o.messages; }))
    );
};

GTxt.ReceiverMonkey._numTexts = function(text){ return Math.ceil(text.length / 160); };
