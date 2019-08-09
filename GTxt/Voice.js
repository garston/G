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

GTxt.Voice.getTxtEmail = function(contact, config) {
    return ['1' + config.gvNumber, (contact.number.toString().length === 10 ? '1' : '') + contact.number, contact.gvKey].join('.') + '@' + this.TXT_DOMAIN;
};

GTxt.Voice.getTxtLines = function(message, isEndOfTxtFn) {
    var lines = message.getPlainBody().split('\n').map(function(line){ return line.trim(); });
    var endOfTxtIndex = JSUtil.ArrayUtil.findIndex(lines, isEndOfTxtFn);
    return endOfTxtIndex < 0 ? [] : lines.slice(2, endOfTxtIndex);
};

GTxt.Voice.parseFromTxt = function(message){
    var match = GASton.Mail.parseFrom(message).email.match(/^\d+\.1?(\d+)\.(.+)@/);
    return { gvKey: match[2], number: +match[1] };
};
