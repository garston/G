GTxt.Voice = {};
GTxt.Voice.GROUP_TXT_SUBJECT = '"group message"';
GTxt.Voice.MISSED_CALL_SUBJECT = '"missed call"';
GTxt.Voice.NO_REPLY_EMAIL = 'voice-noreply@google.com';
GTxt.Voice.TXT_DOMAIN = 'txt.voice.google.com';
GTxt.Voice.TXT_SUBJECT = '"text message"';
GTxt.Voice.VOICEMAIL_SUBJECT = 'voicemail';

GTxt.Voice.getFirstNumberMentioned = function(str){
    var match = str.match(/\((\d+)\) (\d+)-(\d+)/);
    return match && +match.slice(1).join('');
};

GTxt.Voice.getTxtLines = function(message, isEndOfTextFn) {
    var lines = message.getPlainBody().split('\n').map(function(line){ return line.trim(); });
    return lines.slice(2, JSUtil.ArrayUtil.findIndex(lines, isEndOfTextFn));
};

GTxt.Voice.isNotMarketing = function(number){ return number.toString().length === 10; };

GTxt.Voice.parseFromTxt = function(message){
    var match = GASton.Mail.parseFrom(message).email.match(/^\d+\.1?(\d+)\.(.+)@/);
    return { gvKey: match[2], number: +match[1] };
};
