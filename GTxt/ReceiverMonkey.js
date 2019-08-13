GTxt.ReceiverMonkey = {};

GTxt.ReceiverMonkey.txtPhysicalPhone = function(msgObjs, config) {
    var origText = msgObjs.map(function(obj){ return obj.text; }).join(GTxt.DOUBLE_SEPARATOR);
    var compressedText = GTxt.Compression.compress(origText);
    var text = this._numTexts(compressedText) < this._numTexts(origText) ? compressedText : origText;

    var primaryObj = JSUtil.ArrayUtil.find(msgObjs, function(obj){ return obj.plainMessage; });
    var primaryMsgSubject = primaryObj ? primaryObj.message.getSubject() : Date.now().toString();

    msgObjs.forEach(function(obj){
        if(obj === primaryObj){
            GASton.Mail.forward(obj.plainMessage, text, config.getPhysicalPhoneContactTxtEmail());
        }else{
            if(!primaryObj){
                GASton.Mail.sendToIndividual(primaryMsgSubject, text, config.getPhysicalPhoneContactTxtEmail())
            }
            GASton.Mail.forward(obj.message, 'Handled by: ' + primaryMsgSubject, Session.getActiveUser().getEmail());
        }
    });
};

GTxt.ReceiverMonkey._numTexts = function(text){ return Math.ceil(text.length / 160); };
