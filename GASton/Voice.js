GASton.Voice = {};
GASton.Voice.DOMAIN = 'txt.voice.google.com';
GASton.Voice.MISSED_CALL_SUBJECT = '"missed call"';
GASton.Voice.TXT_SUBJECT = '"text message"';

GASton.Voice.forwardTxt = function(message, text, gvNumber, number, gvKey){
    GASton.Mail.forward(message, text, '1' + gvNumber + '.' + (number.toString().length === 10 ? 1 : '') + number + '.' + gvKey + '@' + this.DOMAIN);
};

GASton.Voice.getMissedCallNumber = function(message){
    var match = message.getBody().match(/\((\d+)\) (\d+)-(\d+)/);
    return match && match.slice(1).join('');
};

GASton.Voice.getTxt = function(message){
    var lines = message.getPlainBody().split('\n').map(function(line){ return line.trim(); });
    var endOfTxtLineIndex = JSUtil.ArrayUtil.findIndex(lines, function(line) {
        return JSUtil.ArrayUtil.contains(['To respond to this text message, reply to this email or visit Google Voice.', 'YOUR ACCOUNT <https://www.google.com/voice/> HELP CENTER'], line);
    });
    return lines.slice(2, endOfTxtLineIndex).join(' ');
};

GASton.Voice.parseFromTxt = function(message){
    var match = GASton.Mail.parseFrom(message).email.match(/^\d+\.(\d+)\.(.+)@/);
    return { gvKey: match[2], number: parseInt(match[1].substring(match[1].length === 11 ? 1 : 0)) };
};
