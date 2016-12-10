PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.mailingListEmail = thread.getMessages()[0].getReplyTo();
    this.sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '').replace('Full Court', 'Basketball');
};

PhysEd.InBasedThread.sendInitialEmail = function(league, dayOfWeek){
    var subject = (league.sportName === 'Basketball' ? 'Full Court ' + JSUtil.DateUtil.dayOfWeekString(dayOfWeek) : league.sportName + ' Tomorrow') + this._generateRandomExclamations();
    GASton.MailSender.sendToList(subject, '', league.getMailingList().email);
};

PhysEd.InBasedThread.prototype.sendPlayerCountEmail = function(playerStatusParser, introLines, endLines) {
    if(playerStatusParser.inPlayers.length) {
        var bodyLines = introLines.
            concat(JSUtil.ArrayUtil.compact([
                this._toPlayerNames('In', playerStatusParser.inPlayers),
                this._toPlayerNames('Maybe', playerStatusParser.maybePlayers),
                this._toPlayerNames('Out', playerStatusParser.outPlayers),
                this._toPlayerNames('Unknown', playerStatusParser.unknownPlayers)
            ])).
            concat('').
            concat(endLines);
        GASton.MailSender.replyAll(this.thread, bodyLines.join('<br/>'), this.mailingListEmail);
    }
};

PhysEd.InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return JSUtil.ArrayUtil.range(num).reduce(function(str){ return str + '!'; }, '');
};

PhysEd.InBasedThread.prototype._toPlayerNames = function(categoryDisplayString, players) {
    if(players.length){
        var playerStrings = players.map(PhysEd.Transformers.personToDisplayString);
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
