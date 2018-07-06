GTxt.ReceiverMonkey = {};

GTxt.ReceiverMonkey.txtPhysicalPhone = function(msgObjs, config) {
    var primaryObj = JSUtil.ArrayUtil.find(msgObjs, function(obj){ return obj.plainMessage; });
    if(!primaryObj){
        return;
    }

    msgObjs.forEach(function(obj){
        if(obj === primaryObj){
            var text = msgObjs.map(function(obj){ return obj.text; }).join(GTxt.DOUBLE_SEPARATOR);
            var compressedText = GTxt.Compression.compress(text);
            GTxt.Util.sendTxt(obj.message, this._numTexts(compressedText) < this._numTexts(text) ? compressedText : text, config.getPhysicalPhoneContact(), config);
        }else{
            GASton.Mail.forward(obj.message, 'Handled by batch: ' + primaryObj.message.getSubject(), Session.getActiveUser().getEmail());
        }
    }, this);
};

GTxt.ReceiverMonkey._numTexts = function(text){ return Math.ceil(text.length / 160); };
