GTxt.Voice = {};
GTxt.Voice.GROUP_TXT_SUBJECT = '"group message"';
GTxt.Voice.MISSED_CALL_SUBJECT = '"missed call"';
GTxt.Voice.NO_REPLY_EMAIL = 'voice-noreply@google.com';
GTxt.Voice.TXT_DOMAIN = 'txt.voice.google.com';
GTxt.Voice.TXT_SUBJECT = '"text message"';

GTxt.Voice.forwardTxt = function(message, text, gvNumber, number, gvKey){
    GASton.Mail.forward(message, text, '1' + gvNumber + '.' + (number.toString().length === 10 ? 1 : '') + number + '.' + gvKey + '@' + this.TXT_DOMAIN);
};

GTxt.Voice.getFirstNumberMentioned = function(str){
    var match = str.match(/\((\d+)\) (\d+)-(\d+)/);
    return match && +match.slice(1).join('');
};

GTxt.Voice.getTxt = function(message){
    var lines = message.getPlainBody().split('\n').map(function(line){ return line.trim(); });
    var endOfTxtLineIndex = JSUtil.ArrayUtil.findIndex(lines, function(line) {
        return line === 'To respond to this text message, reply to this email or visit Google Voice.' || JSUtil.StringUtil.startsWith(line, 'YOUR ACCOUNT ');
    });
    return lines.slice(2, endOfTxtLineIndex).join(' ');
};

GTxt.Voice.parseFromTxt = function(message){
    var match = GASton.Mail.parseFrom(message).email.match(/^\d+\.1?(\d+)\.(.+)@/);
    return { gvKey: match[2], number: +match[1] };
};
