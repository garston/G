GASton.Voice = {};
GASton.Voice.DOMAIN = 'txt.voice.google.com';
GASton.Voice.SUBJECT = 'SMS';

GASton.Voice.forwardTxt = function(message, text, gvNumber, number, gvKey){
    GASton.Mail.forward(message, text, '1' + gvNumber + '.1' + number + '.' + gvKey + '@' + this.DOMAIN);
};

GASton.Voice.getMissedCallNumber = function(message){ return message.getBody().match(/\((\d+)\) (\d+)-(\d+)/).slice(1).join(''); };

GASton.Voice.parseFromTxt = function(message){
    var match = GASton.Mail.parseFrom(message).email.match(/^\d+\.1(\d+)\.(.+)@/);
    return { gvKey: match[2], number: parseInt(match[1]) };
};
